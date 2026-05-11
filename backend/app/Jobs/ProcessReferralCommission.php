<?php
namespace App\Jobs;

use App\Models\User;
use App\Services\CommissionService;
use App\Models\Package;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class ProcessReferralCommission implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $referrer, public User $referred, public Package $package) {}

    public function handle(CommissionService $commissionService): void
    {
        $commissionService->awardReferralBonus($this->referrer, $this->referred, $this->package);
    }
}
