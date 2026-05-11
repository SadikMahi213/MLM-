<?php
namespace App\Services;

use App\Models\User;
use App\Models\Package;
use App\Models\Commission;
use App\Models\DailyTask;
use App\Models\Wallet;
use App\Notifications\CommissionCredited;

class CommissionService
{
    public function awardBinaryBonus(User $user, float $amount): Commission
    {
        $commission = Commission::create([
            'user_id' => $user->id,
            'type' => 'binary',
            'amount' => $amount,
            'status' => 'credited',
            'credited_at' => now(),
        ]);

        $wallet = $user->wallet;
        if ($wallet) {
            $wallet->credit($amount, 'binary_bonus', 'Binary bonus awarded');
        }

        $user->notify(new CommissionCredited($commission));

        return $commission;
    }

    public function awardReferralBonus(User $referrer, User $referred, Package $package): Commission
    {
        $percentage = $package->referral_bonus_percent > 0
            ? $package->referral_bonus_percent
            : config('mlm.commission.referral.default_percentage', 10);

        $amount = ($package->price * $percentage) / 100;

        $commission = Commission::create([
            'user_id' => $referrer->id,
            'from_user_id' => $referred->id,
            'type' => 'referral',
            'amount' => $amount,
            'percentage' => $percentage,
            'status' => 'credited',
            'description' => "Referral bonus for {$referred->name} purchasing {$package->name}",
            'credited_at' => now(),
        ]);

        $wallet = $referrer->wallet;
        if ($wallet) {
            $wallet->credit($amount, 'referral_bonus', $commission->description);
        }

        $referrer->notify(new CommissionCredited($commission));

        return $commission;
    }

    public function awardGenerationBonus(User $user, float $amount, int $generation): Commission
    {
        $percentageKey = 'level_' . $generation;
        $percentage = config("mlm.commission.generation.{$percentageKey}", 0);

        if ($percentage <= 0) {
            throw new \InvalidArgumentException("Invalid generation level: {$generation}");
        }

        $bonusAmount = ($amount * $percentage) / 100;

        $commission = Commission::create([
            'user_id' => $user->id,
            'type' => 'generation',
            'amount' => $bonusAmount,
            'percentage' => $percentage,
            'status' => 'credited',
            'description' => "Generation {$generation} bonus",
            'credited_at' => now(),
        ]);

        $wallet = $user->wallet;
        if ($wallet) {
            $wallet->credit($bonusAmount, 'generation_bonus', $commission->description);
        }

        $user->notify(new CommissionCredited($commission));

        return $commission;
    }

    public function awardDailyTaskReward(User $user, DailyTask $task): Commission
    {
        $commission = Commission::create([
            'user_id' => $user->id,
            'type' => 'daily_task',
            'amount' => $task->reward,
            'status' => 'credited',
            'description' => "Reward for completing task: {$task->title}",
            'credited_at' => now(),
        ]);

        $wallet = $user->wallet;
        if ($wallet) {
            $wallet->credit($task->reward, 'daily_income', $commission->description);
        }

        $user->notify(new CommissionCredited($commission));

        return $commission;
    }
}
