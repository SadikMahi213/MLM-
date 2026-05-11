<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'balance' => (float) $this->balance,
            'income_balance' => (float) $this->income_balance,
            'bonus_balance' => (float) $this->bonus_balance,
            'withdrawable_balance' => (float) $this->withdrawable_balance,
            'total_deposited' => (float) $this->total_deposited,
            'total_withdrawn' => (float) $this->total_withdrawn,
            'total_income' => (float) $this->total_income,
        ];
    }
}
