<?php
namespace App\Console\Commands;

use App\Models\DeviceSession;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupExpiredSessions extends Command
{
    protected $signature = 'mlm:cleanup-sessions';
    protected $description = 'Clean up expired device sessions';

    public function handle()
    {
        $cleaned = DeviceSession::where('last_activity', '<', Carbon::now()->subDays(30))
            ->orWhere(function ($query) {
                $query->whereNull('last_activity')
                    ->where('created_at', '<', Carbon::now()->subDays(7));
            })
            ->delete();

        $this->info("Cleaned up {$cleaned} expired sessions.");
    }
}
