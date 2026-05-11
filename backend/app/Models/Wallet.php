<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        'user_id', 'balance', 'income_balance', 'bonus_balance',
        'withdrawable_balance', 'total_deposited', 'total_withdrawn', 'total_income'
    ];

    protected $casts = [
        'balance' => 'decimal:8',
        'income_balance' => 'decimal:8',
        'bonus_balance' => 'decimal:8',
        'withdrawable_balance' => 'decimal:8',
        'total_deposited' => 'decimal:8',
        'total_withdrawn' => 'decimal:8',
        'total_income' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function credit($amount, $type, $description = null, $metadata = null)
    {
        return \DB::transaction(function () use ($amount, $type, $description, $metadata) {
            $balanceBefore = $this->balance;
            $this->balance += $amount;
            $this->total_income += $amount;
            $this->withdrawable_balance += $amount;
            $this->save();

            return $this->transactions()->create([
                'user_id' => $this->user_id,
                'type' => $type,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $this->balance,
                'status' => 'completed',
                'description' => $description,
                'metadata' => $metadata,
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);
        });
    }

    public function debit($amount, $type, $description = null, $metadata = null)
    {
        return \DB::transaction(function () use ($amount, $type, $description, $metadata) {
            if ($this->balance < $amount) {
                throw new \App\Exceptions\InsufficientBalanceException();
            }

            $balanceBefore = $this->balance;
            $this->balance -= $amount;
            $this->withdrawable_balance -= $amount;
            $this->save();

            return $this->transactions()->create([
                'user_id' => $this->user_id,
                'type' => $type,
                'amount' => -$amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $this->balance,
                'status' => 'completed',
                'description' => $description,
                'metadata' => $metadata,
                'transaction_id' => \Str::uuid(),
                'completed_at' => now(),
            ]);
        });
    }
}
