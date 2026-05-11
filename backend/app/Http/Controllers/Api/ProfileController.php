<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\WalletResource;
use App\Http\Resources\TransactionResource;
use App\Models\WalletTransaction;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('wallet', 'package', 'sponsor', 'currentRank');

        $wallet = $user->wallet;
        $myReferrals = User::where('sponsor_id', $user->id);
        $totalTeam = (clone $myReferrals)->count();
        $activeTeam = (clone $myReferrals)->where('is_active', true)->count();

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->latest()->take(5)->get();

        $totalEarnings = Commission::where('user_id', $user->id)
            ->where('status', 'credited')->sum('amount');

        $pendingEarnings = Commission::where('user_id', $user->id)
            ->where('status', 'pending')->sum('amount');

        $currentMonthEarnings = Commission::where('user_id', $user->id)
            ->where('status', 'credited')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount');

        $lastWithdrawal = $user->withdrawals()
            ->whereIn('status', ['completed', 'approved'])
            ->latest()->first();

        $currentRank = $user->currentRank()->first();
        $nextRank = null;
        if ($currentRank) {
            $nextRank = \App\Models\Rank::where('level', $currentRank->level + 1)->first();
        } else {
            $nextRank = \App\Models\Rank::where('level', 1)->first();
        }

        return response()->json([
            'user' => new UserResource($user),
            'wallet' => $wallet ? new WalletResource($wallet) : null,
            'total_earnings' => $totalEarnings,
            'pending_earnings' => $pendingEarnings,
            'current_month_earnings' => $currentMonthEarnings,
            'total_team' => $totalTeam,
            'active_team' => $activeTeam,
            'recent_transactions' => TransactionResource::collection($recentTransactions),
            'last_withdrawal' => $lastWithdrawal ? [
                'amount' => (float) $lastWithdrawal->amount,
                'status' => $lastWithdrawal->status,
                'created_at' => $lastWithdrawal->created_at,
                'payment_method' => $lastWithdrawal->payment_method,
            ] : null,
            'current_rank' => $currentRank ? [
                'id' => $currentRank->id,
                'name' => $currentRank->name,
                'level' => $currentRank->level,
                'icon' => $currentRank->icon,
                'achieved_at' => $currentRank->pivot?->achieved_at,
            ] : null,
            'next_rank' => $nextRank ? [
                'id' => $nextRank->id,
                'name' => $nextRank->name,
                'level' => $nextRank->level,
                'icon' => $nextRank->icon,
            ] : null,
            'unread_notifications_count' => $user->notifications()->whereNull('read_at')->count(),
        ]);
    }
}
