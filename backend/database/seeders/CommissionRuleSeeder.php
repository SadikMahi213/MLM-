<?php

namespace Database\Seeders;

use App\Models\CommissionRule;
use Illuminate\Database\Seeder;

class CommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            ['name' => 'Referral Bonus', 'type' => 'referral', 'level' => 1, 'percentage' => 10.00, 'description' => 'Direct referral bonus percentage'],
            ['name' => 'Binary Bonus', 'type' => 'binary', 'level' => 1, 'percentage' => 10.00, 'description' => 'Binary pairing bonus percentage'],
            ['name' => 'Generation Level 1', 'type' => 'generation', 'level' => 1, 'percentage' => 5.00, 'description' => 'First generation bonus'],
            ['name' => 'Generation Level 2', 'type' => 'generation', 'level' => 2, 'percentage' => 3.00, 'description' => 'Second generation bonus'],
            ['name' => 'Generation Level 3', 'type' => 'generation', 'level' => 3, 'percentage' => 1.00, 'description' => 'Third generation bonus'],
        ];

        foreach ($rules as $rule) {
            CommissionRule::updateOrCreate(
                ['type' => $rule['type'], 'level' => $rule['level']],
                $rule
            );
        }
    }
}
