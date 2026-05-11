<?php
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class WithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:bkash,nagad,bank',
            'account_number' => 'required|string',
            'account_holder' => 'nullable|string',
        ];
    }
}
