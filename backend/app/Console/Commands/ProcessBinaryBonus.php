<?php
namespace App\Console\Commands;

use App\Models\User;
use App\Services\BinaryService;
use Illuminate\Console\Command;

class ProcessBinaryBonus extends Command
{
    protected $signature = 'mlm:process-binary-bonus';
    protected $description = 'Process binary bonuses for all active users';

    public function handle(BinaryService $binaryService)
    {
        $users = User::where('is_active', true)->whereNotNull('package_id')->get();

        foreach ($users as $user) {
            try {
                $binaryService->calculateBinaryBonus($user);
            } catch (\Exception $e) {
                $this->error("Failed to process binary bonus for user {$user->username}: {$e->getMessage()}");
            }
        }

        $this->info('Binary bonus processing completed.');
    }
}
