<?php
namespace App\Jobs;

use App\Models\User;
use App\Services\BinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class ProcessBinaryCommission implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user) {}

    public function handle(BinaryService $binaryService): void
    {
        $binaryService->calculateBinaryBonus($this->user);
    }
}
