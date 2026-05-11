<?php
namespace Database\Seeders;

use App\Models\Rank;
use Illuminate\Database\Seeder;

class RankSeeder extends Seeder
{
    public function run(): void
    {
        $ranks = [
            [
                'name' => 'Starter',
                'level' => 1,
                'min_direct_referrals' => 0,
                'min_team_members' => 0,
                'min_active_team' => 0,
                'min_team_bv' => 0,
                'bonus_percent' => 0,
                'icon' => 'star',
                'description' => 'Beginner rank — start building your team',
                'benefits' => json_encode(['Basic commissions', 'Access to platform']),
                'is_active' => true,
            ],
            [
                'name' => 'Silver',
                'level' => 2,
                'min_direct_referrals' => 3,
                'min_team_members' => 10,
                'min_active_team' => 5,
                'min_team_bv' => 500,
                'bonus_percent' => 2,
                'icon' => 'medal',
                'description' => 'Silver rank — growing leader',
                'benefits' => json_encode(['2% team volume bonus', 'Priority support']),
                'is_active' => true,
            ],
            [
                'name' => 'Gold',
                'level' => 3,
                'min_direct_referrals' => 10,
                'min_team_members' => 50,
                'min_active_team' => 25,
                'min_team_bv' => 5000,
                'bonus_percent' => 5,
                'icon' => 'crown',
                'description' => 'Gold rank — top performer',
                'benefits' => json_encode(['5% team volume bonus', 'Weekly payout priority', 'Gold badge']),
                'is_active' => true,
            ],
            [
                'name' => 'Diamond',
                'level' => 4,
                'min_direct_referrals' => 25,
                'min_team_members' => 200,
                'min_active_team' => 100,
                'min_team_bv' => 25000,
                'bonus_percent' => 8,
                'icon' => 'gem',
                'description' => 'Diamond rank — elite networker',
                'benefits' => json_encode(['8% team volume bonus', 'Daily payout priority', 'Diamond badge', 'Exclusive webinars']),
                'is_active' => true,
            ],
            [
                'name' => 'Elite',
                'level' => 5,
                'min_direct_referrals' => 50,
                'min_team_members' => 500,
                'min_active_team' => 250,
                'min_team_bv' => 100000,
                'bonus_percent' => 12,
                'icon' => 'trophy',
                'description' => 'Elite rank — highest achievement',
                'benefits' => json_encode(['12% team volume bonus', 'Instant payout priority', 'Elite trophy', 'All-expenses-paid events', 'Revenue share']),
                'is_active' => true,
            ],
        ];

        foreach ($ranks as $rank) {
            Rank::updateOrCreate(
                ['level' => $rank['level']],
                $rank
            );
        }
    }
}
