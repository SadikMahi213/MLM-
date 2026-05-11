<?php
namespace App\Services;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public function getBalance(User $user)
    {
        return $user->wallet;
    }

    public function deposit(User $user, float $amount, array $data = []): WalletTransaction
    {
        $wallet = $user->wallet;
        if (!$wallet) {
            throw new \RuntimeException('User has no wallet');
        }

        return DB::transaction(function () use ($wallet, $amount, $data) {
            $balanceBefore = $wallet->balance;
            $wallet->balance += $amount;
            $wallet->total_deposited += $amount;
            $wallet->withdrawable_balance += $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'user_id' => $wallet->user_id,
                'type' => 'deposit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'status' => 'completed',
                'description' => $data['description'] ?? 'Deposit',
                'metadata' => $data['metadata'] ?? null,
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);
        });
    }

    public function withdraw(User $user, float $amount, array $data = []): WalletTransaction
    {
        $wallet = $user->wallet;
        if (!$wallet) {
            throw new \RuntimeException('User has no wallet');
        }

        if ($wallet->withdrawable_balance < $amount) {
            throw new \App\Exceptions\InsufficientBalanceException();
        }

        return DB::transaction(function () use ($wallet, $amount, $data) {
            $balanceBefore = $wallet->balance;
            $wallet->balance -= $amount;
            $wallet->withdrawable_balance -= $amount;
            $wallet->total_withdrawn += $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'user_id' => $wallet->user_id,
                'type' => 'withdrawal',
                'amount' => -$amount,
                'fee' => $data['fee'] ?? 0,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'status' => 'completed',
                'description' => $data['description'] ?? 'Withdrawal',
                'metadata' => $data['metadata'] ?? null,
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);
        });
    }

    public function transfer(User $from, User $to, float $amount): WalletTransaction
    {
        $fromWallet = $from->wallet;
        $toWallet = $to->wallet;

        if (!$fromWallet || !$toWallet) {
            throw new \RuntimeException('Both users must have wallets');
        }

        if ($fromWallet->balance < $amount) {
            throw new \App\Exceptions\InsufficientBalanceException();
        }

        return DB::transaction(function () use ($fromWallet, $toWallet, $from, $to, $amount) {
            $fromBalanceBefore = $fromWallet->balance;
            $fromWallet->balance -= $amount;
            $fromWallet->save();

            $toBalanceBefore = $toWallet->balance;
            $toWallet->balance += $amount;
            $toWallet->save();

            $transaction = $fromWallet->transactions()->create([
                'user_id' => $from->id,
                'type' => 'transfer',
                'amount' => -$amount,
                'balance_before' => $fromBalanceBefore,
                'balance_after' => $fromWallet->balance,
                'status' => 'completed',
                'description' => "Transfer to {$to->name}",
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);

            $toWallet->transactions()->create([
                'user_id' => $to->id,
                'type' => 'transfer',
                'amount' => $amount,
                'balance_before' => $toBalanceBefore,
                'balance_after' => $toWallet->balance,
                'status' => 'completed',
                'description' => "Transfer from {$from->name}",
                'reference_type' => get_class($transaction),
                'reference_id' => $transaction->id,
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);

            return $transaction;
        });
    }

    public function getTransactions(User $user, array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = WalletTransaction::where('user_id', $user->id);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function getIncomeSummary(User $user): array
    {
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereIn('type', ['daily_income', 'binary_bonus', 'referral_bonus', 'generation_bonus'])
            ->get();

        return [
            'total_income' => $transactions->where('amount', '>', 0)->sum('amount'),
            'daily_income' => $transactions->where('type', 'daily_income')->sum('amount'),
            'binary_bonus' => $transactions->where('type', 'binary_bonus')->sum('amount'),
            'referral_bonus' => $transactions->where('type', 'referral_bonus')->sum('amount'),
            'generation_bonus' => $transactions->where('type', 'generation_bonus')->sum('amount'),
        ];
    }
}
