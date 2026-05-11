<?php
namespace App\Notifications;

use App\Models\Commission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CommissionCredited extends Notification
{
    use Queueable;

    public function __construct(public Commission $commission) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'commission_id' => $this->commission->id,
            'type' => $this->commission->type,
            'amount' => $this->commission->amount,
            'message' => "You received \${$this->commission->amount} as {$this->commission->type} commission.",
        ];
    }
}
