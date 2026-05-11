<?php
namespace App\Console\Commands;

use App\Models\User;
use App\Models\Commission;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ProcessDailyIncome extends Command
{
    protected $signature = 'mlm:process-daily-income';
    protected $description = 'Process daily income for all active users';

    public function handle()
    {
        $users = User::where('is_active', true)->whereNotNull('package_id')->get();

        foreach ($users as $user) {
            $package = $user->package;
            if (!$package || $package->daily_income <= 0) continue;

            try {
                $wallet = $user->wallet;
                $transaction = $wallet->credit(
                    $package->daily_income,
                    'daily_income',
                    "Daily income from {$package->name} package"
                );

                Commission::create([
                    'user_id' => $user->id,
                    'type' => 'daily_task',
                    'amount' => $package->daily_income,
                    'status' => 'credited',
                    'description' => "Daily income from {$package->name} package",
                    'credited_at' => now(),
                ]);

                $this->info("Daily income processed for user {$user->username}: \${$package->daily_income}");
            } catch (\Exception $e) {
                $this->error("Failed to process daily income for user {$user->username}: {$e->getMessage()}");
            }
        }

        $this->info('Daily income processing completed.');
    }
}
