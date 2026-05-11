<?php
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'telecom_code' => 'required|string|max:10',
            'country' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'password' => 'required|string|min:8|confirmed',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'sponsor_code' => 'nullable|string|exists:users,username',
            'package_id' => 'nullable|exists:packages,id',
            'team' => 'required|in:A,B',
        ];
    }
}
