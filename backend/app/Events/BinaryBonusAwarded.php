<?php
namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BinaryBonusAwarded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public User $user, public float $amount, public float $leftBv, public float $rightBv) {}
}
