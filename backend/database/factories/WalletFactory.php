<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'balance' => 0,
            'income_balance' => 0,
            'bonus_balance' => 0,
            'withdrawable_balance' => 0,
            'total_deposited' => 0,
            'total_withdrawn' => 0,
            'total_income' => 0,
        ];
    }
}
