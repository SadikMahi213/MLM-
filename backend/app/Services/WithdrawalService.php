<?php
namespace App\Services;

use App\Models\User;
use App\Models\Withdrawal;
use App\Exceptions\FraudDetectionException;
use App\Notifications\WithdrawalStatus;
use Illuminate\Support\Facades\DB;

class WithdrawalService
{
    public function createWithdrawal(User $user, float $amount, string $method, array $accountDetails): Withdrawal
    {
        $minAmount = config('mlm.withdrawal.minimum_amount', 10);
        $maxAmount = config('mlm.withdrawal.maximum_amount', 10000);
        $dailyLimit = config('mlm.withdrawal.daily_limit', 5000);
        $cooldownHours = config('mlm.withdrawal.cooldown_hours', 24);

        if ($amount < $minAmount) {
            throw new \InvalidArgumentException("Minimum withdrawal amount is \${$minAmount}");
        }

        if ($amount > $maxAmount) {
            throw new \InvalidArgumentException("Maximum withdrawal amount is \${$maxAmount}");
        }

        $todayTotal = Withdrawal::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        if (($todayTotal + $amount) > $dailyLimit) {
            throw new \InvalidArgumentException("Daily withdrawal limit is \${$dailyLimit}");
        }

        $lastWithdrawal = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved', 'completed'])
            ->latest()
            ->first();

        if ($lastWithdrawal && $lastWithdrawal->created_at->diffInHours(now()) < $cooldownHours) {
            throw new \InvalidArgumentException("Please wait {$cooldownHours} hours between withdrawals");
        }

        $wallet = $user->wallet;
        if (!$wallet || $wallet->withdrawable_balance < $amount) {
            throw new \App\Exceptions\InsufficientBalanceException();
        }

        $feePercentage = config('mlm.withdrawal.fee_percentage', 2);
        $fee = ($amount * $feePercentage) / 100;
        $netAmount = $amount - $fee;

        return DB::transaction(function () use ($user, $amount, $method, $accountDetails, $fee, $netAmount) {
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'payment_method' => $method,
                'account_number' => $accountDetails['account_number'],
                'account_holder' => $accountDetails['account_holder'] ?? null,
                'status' => 'pending',
                'metadata' => $accountDetails['metadata'] ?? null,
            ]);

            $this->checkFraud($withdrawal);

            return $withdrawal;
        });
    }

    public function approveWithdrawal(Withdrawal $withdrawal, User $admin): void
    {
        if ($withdrawal->status !== 'pending') {
            throw new \InvalidArgumentException('Only pending withdrawals can be approved');
        }

        DB::transaction(function () use ($withdrawal, $admin) {
            $withdrawal->update([
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);

            $withdrawal->user->notify(new WithdrawalStatus($withdrawal, 'approved'));
        });
    }

    public function rejectWithdrawal(Withdrawal $withdrawal, User $admin, string $reason): void
    {
        if (!in_array($withdrawal->status, ['pending', 'approved'])) {
            throw new \InvalidArgumentException('Withdrawal cannot be rejected in its current state');
        }

        DB::transaction(function () use ($withdrawal, $admin, $reason) {
            $wallet = $withdrawal->user->wallet;
            if ($wallet) {
                $wallet->balance += $withdrawal->amount;
                $wallet->withdrawable_balance += $withdrawal->amount;
                $wallet->save();
            }

            $withdrawal->update([
                'status' => 'rejected',
                'admin_note' => $reason,
                'approved_by' => $admin->id,
            ]);

            $withdrawal->user->notify(new WithdrawalStatus($withdrawal, 'rejected'));
        });
    }

    public function checkFraud(Withdrawal $withdrawal): void
    {
        $recentWithdrawals = Withdrawal::where('user_id', $withdrawal->user_id)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        if ($recentWithdrawals > 5) {
            throw new FraudDetectionException('Multiple withdrawal requests in short period');
        }

        $user = $withdrawal->user;
        $userAge = $user->created_at->diffInDays(now());
        if ($userAge < 1 && $withdrawal->amount > 100) {
            throw new FraudDetectionException('New users cannot withdraw large amounts');
        }
    }
}
