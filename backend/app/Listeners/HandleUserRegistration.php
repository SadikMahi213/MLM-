<?php
namespace App\Listeners;

use App\Events\UserRegistered;
use App\Models\Wallet;
use App\Services\BinaryService;
use App\Jobs\ProcessReferralCommission;

class HandleUserRegistration
{
    public function __construct(private BinaryService $binaryService) {}

    public function handle(UserRegistered $event): void
    {
        $wallet = Wallet::create(['user_id' => $event->user->id]);

        $this->binaryService->placeUser($event->user, $event->sponsor, $event->position);

        if ($event->sponsor && $event->user->package) {
            ProcessReferralCommission::dispatch(
                $event->sponsor,
                $event->user,
                $event->user->package
            );
        }
    }
}
