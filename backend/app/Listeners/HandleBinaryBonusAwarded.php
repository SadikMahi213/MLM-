<?php
namespace App\Listeners;

use App\Events\BinaryBonusAwarded;
use App\Notifications\CommissionCredited;

class HandleBinaryBonusAwarded
{
    public function handle(BinaryBonusAwarded $event): void
    {
        $event->user->notify(new CommissionCredited(
            new \App\Models\Commission([
                'user_id' => $event->user->id,
                'type' => 'binary',
                'amount' => $event->amount,
                'status' => 'credited',
            ])
        ));
    }
}
