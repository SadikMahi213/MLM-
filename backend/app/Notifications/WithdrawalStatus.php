<?php
namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WithdrawalStatus extends Notification
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal, public string $status) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'withdrawal_id' => $this->withdrawal->id,
            'amount' => $this->withdrawal->amount,
            'status' => $this->status,
            'message' => "Withdrawal of \${$this->withdrawal->amount} has been {$this->status}.",
        ];
    }
}
