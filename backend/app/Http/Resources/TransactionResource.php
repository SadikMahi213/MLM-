<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'fee' => (float) $this->fee,
            'balance_before' => (float) $this->balance_before,
            'balance_after' => (float) $this->balance_after,
            'status' => $this->status,
            'description' => $this->description,
            'transaction_id' => $this->transaction_id,
            'created_at' => $this->created_at,
            'completed_at' => $this->completed_at,
        ];
    }
}
