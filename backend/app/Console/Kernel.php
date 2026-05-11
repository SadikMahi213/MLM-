<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('mlm:process-daily-income')->dailyAt('00:00');
        $schedule->command('mlm:process-binary-bonus')->everyFifteenMinutes();
        $schedule->command('mlm:cleanup-sessions')->daily();
        $schedule->command('auth:clear-resets')->daily();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
