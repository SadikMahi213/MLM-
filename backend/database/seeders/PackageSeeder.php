<?php
namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Free',
                'type' => 'free',
                'price' => 0,
                'daily_income' => 0,
                'binary_bonus_percent' => 0,
                'referral_bonus_percent' => 5,
                'generation_bonus_percent' => 1,
                'duration_days' => 0,
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Starter',
                'type' => 'paid',
                'price' => 50,
                'daily_income' => 1.5,
                'binary_bonus_percent' => 5,
                'referral_bonus_percent' => 10,
                'generation_bonus_percent' => 2,
                'duration_days' => 365,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Silver',
                'type' => 'paid',
                'price' => 200,
                'daily_income' => 6,
                'binary_bonus_percent' => 8,
                'referral_bonus_percent' => 12,
                'generation_bonus_percent' => 3,
                'duration_days' => 365,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Gold',
                'type' => 'paid',
                'price' => 500,
                'daily_income' => 17.5,
                'binary_bonus_percent' => 10,
                'referral_bonus_percent' => 15,
                'generation_bonus_percent' => 4,
                'duration_days' => 365,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Platinum',
                'type' => 'paid',
                'price' => 1000,
                'daily_income' => 40,
                'binary_bonus_percent' => 12,
                'referral_bonus_percent' => 20,
                'generation_bonus_percent' => 5,
                'duration_days' => 365,
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(
                ['name' => $package['name']],
                $package
            );
        }
    }
}
