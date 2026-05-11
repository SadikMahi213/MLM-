<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'from_user_id' => User::factory(),
            'type' => $this->faker->randomElement(['binary', 'referral', 'generation', 'daily_task']),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'percentage' => $this->faker->randomFloat(2, 1, 20),
            'status' => $this->faker->randomElement(['pending', 'credited', 'failed']),
            'description' => $this->faker->sentence(),
            'credited_at' => now(),
        ];
    }
}
