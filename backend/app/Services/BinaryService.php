<?php
namespace App\Services;

use App\Models\User;
use App\Models\BinaryPosition;
use App\Models\Commission;
use App\Events\BinaryBonusAwarded;
use Illuminate\Support\Facades\DB;

class BinaryService
{
    public function placeUser(User $user, ?User $sponsor, ?string $side = null): BinaryPosition
    {
        if (!$sponsor) {
            return BinaryPosition::create([
                'user_id' => $user->id,
                'parent_id' => null,
                'position' => null,
                'path' => str_pad($user->id, 10, '0', STR_PAD_LEFT),
                'level' => 0,
            ]);
        }

        $sponsorPosition = $sponsor->binaryPosition;
        if (!$sponsorPosition) {
            throw new \RuntimeException('Sponsor has no binary position');
        }

        if ($side && !in_array($side, ['A', 'B'])) {
            throw new \InvalidArgumentException('Position must be A or B');
        }

        if (!$side) {
            $side = $this->findWeakestSide($sponsorPosition);
        }

        $occupied = BinaryPosition::where('parent_id', $sponsor->id)
            ->where('position', $side)
            ->exists();

        if ($occupied) {
            $sub = BinaryPosition::where('parent_id', $sponsor->id)
                ->where('position', $side)
                ->first();
            $subUser = User::find($sub->user_id);
            return $this->placeUser($user, $subUser, $side);
        }

        $path = $sponsorPosition->path . '.' . str_pad($user->id, 10, '0', STR_PAD_LEFT);

        $position = BinaryPosition::create([
            'user_id' => $user->id,
            'parent_id' => $sponsor->id,
            'position' => $side,
            'path' => $path,
            'level' => $sponsorPosition->level + 1,
        ]);

        $this->updateMemberCounts($sponsor, $side);

        return $position;
    }

    public function calculateBinaryBonus(User $user): void
    {
        $position = $user->binaryPosition;
        if (!$position) return;

        $leftBv = $position->left_bv + $position->carry_forward_left;
        $rightBv = $position->right_bv + $position->carry_forward_right;

        $matchBv = min($leftBv, $rightBv);
        if ($matchBv <= 0) return;

        $package = $user->package;
        $bonusPercent = $package ? $package->binary_bonus_percent : config('mlm.binary.matching_percentage', 10);
        $bonusAmount = ($matchBv * $bonusPercent) / 100;

        $carryForwardLeft = $leftBv - $matchBv;
        $carryForwardRight = $rightBv - $matchBv;

        if (!config('mlm.binary.carry_forward_enabled', true)) {
            $carryForwardLeft = 0;
            $carryForwardRight = 0;
        }

        if (config('mlm.binary.flush_daily', false)) {
            $carryForwardLeft = 0;
            $carryForwardRight = 0;
        }

        DB::transaction(function () use ($user, $position, $bonusAmount, $matchBv, $leftBv, $rightBv, $carryForwardLeft, $carryForwardRight) {
            $position->left_bv = 0;
            $position->right_bv = 0;
            $position->carry_forward_left = $carryForwardLeft;
            $position->carry_forward_right = $carryForwardRight;
            $position->save();

            if ($bonusAmount > 0) {
                Commission::create([
                    'user_id' => $user->id,
                    'type' => 'binary',
                    'amount' => $bonusAmount,
                    'percentage' => $bonusAmount > 0 ? ($bonusAmount / $matchBv) * 100 : 0,
                    'status' => 'credited',
                    'description' => "Binary bonus on {$matchBv} BV match",
                    'credited_at' => now(),
                ]);

                $wallet = $user->wallet;
                if ($wallet) {
                    $wallet->credit($bonusAmount, 'binary_bonus', "Binary bonus on {$matchBv} BV match");
                }

                BinaryBonusAwarded::dispatch($user, $bonusAmount, $leftBv, $rightBv);
            }
        });
    }

    public function addBusinessVolume(User $user, float $amount): void
    {
        $position = $user->binaryPosition;
        if (!$position) return;

        DB::transaction(function () use ($position, $amount, $user) {
            $ancestors = BinaryPosition::where('path', 'like', $position->path . '%')
                ->where('user_id', '!=', $user->id)
                ->orderBy('level', 'desc')
                ->get();

            foreach ($ancestors as $ancestor) {
                $childPosition = BinaryPosition::where('user_id', $user->id)->first();
                $isLeft = false;

                if ($childPosition && $childPosition->path) {
                    $ancestorPath = $ancestor->path;
                    $childPath = $childPosition->path;
                    if (str_starts_with($childPath, $ancestorPath)) {
                        $remaining = substr($childPath, strlen($ancestorPath) + 1);
                        $segments = explode('.', $remaining);
                        if (!empty($segments[0])) {
                            $firstChild = BinaryPosition::where('path', $ancestorPath . '.' . $segments[0])->first();
                            if ($firstChild && $firstChild->position === 'A') {
                                $isLeft = true;
                            }
                        }
                    }
                }

                if ($isLeft) {
                    $ancestor->left_bv += $amount;
                    $ancestor->total_left_members += 1;
                } else {
                    $ancestor->right_bv += $amount;
                    $ancestor->total_right_members += 1;
                }
                $ancestor->save();
            }
        });
    }

    public function getBinaryTree(User $user, int $depth = 5): array
    {
        $position = $user->binaryPosition;
        if (!$position) return [];

        return $this->buildTree($position, 0, $depth);
    }

    private function buildTree(BinaryPosition $position, int $currentDepth, int $maxDepth): array
    {
        if ($currentDepth >= $maxDepth) {
            return [];
        }

        $user = $position->user;
        $leftLeg = $position->getLeftLeg();
        $rightLeg = $position->getRightLeg();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar,
            'position' => $position->position,
            'level' => $position->level,
            'left_bv' => $position->left_bv,
            'right_bv' => $position->right_bv,
            'total_left' => $position->total_left_members,
            'total_right' => $position->total_right_members,
            'left' => $leftLeg ? $this->buildTree($leftLeg, $currentDepth + 1, $maxDepth) : null,
            'right' => $rightLeg ? $this->buildTree($rightLeg, $currentDepth + 1, $maxDepth) : null,
        ];
    }

    public function getGenealogy(User $user, int $maxDepth = 10): array
    {
        $position = $user->binaryPosition;
        if (!$position) return [];

        $descendants = BinaryPosition::where('path', 'like', $position->path . '.%')
            ->where('level', '<=', $position->level + $maxDepth)
            ->orderBy('path')
            ->get();

        $tree = [];
        foreach ($descendants as $desc) {
            $parts = explode('.', $desc->path);
            $level = $desc->level - $position->level;
            if ($level > $maxDepth) continue;

            $ref = &$tree;
            foreach ($parts as $i => $part) {
                if ($i <= $position->level) continue;
                $nodeId = (int) $part;
                if (!isset($ref[$nodeId])) {
                    $ref[$nodeId] = [
                        'user' => [
                            'id' => $desc->user_id,
                            'name' => $desc->user->name,
                            'username' => $desc->user->username,
                            'avatar' => $desc->user->avatar,
                        ],
                        'position' => $desc->position,
                        'level' => $desc->level,
                        'children' => [],
                    ];
                }
                $ref = &$ref[$nodeId]['children'];
            }
            unset($ref);
        }

        return $tree;
    }

    private function findWeakestSide(BinaryPosition $position): string
    {
        $leftCount = BinaryPosition::where('parent_id', $position->user_id)
            ->where('position', 'A')
            ->count();

        $rightCount = BinaryPosition::where('parent_id', $position->user_id)
            ->where('position', 'B')
            ->count();

        return $leftCount <= $rightCount ? 'A' : 'B';
    }

    private function updateMemberCounts(User $sponsor, string $side): void
    {
        $ancestors = BinaryPosition::where('path', 'like',
            BinaryPosition::where('user_id', $sponsor->id)->first()->path . '.%'
        )->get();

        foreach ($ancestors as $anc) {
            if ($side === 'A') {
                $anc->total_left_members += 1;
                if ($sponsor->is_active) $anc->active_left_members += 1;
            } else {
                $anc->total_right_members += 1;
                if ($sponsor->is_active) $anc->active_right_members += 1;
            }
            $anc->save();
        }
    }
}
