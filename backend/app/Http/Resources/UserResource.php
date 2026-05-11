<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'telecom_code' => $this->telecom_code,
            'username' => $this->username,
            'avatar' => $this->avatar,
            'profile_photo' => $this->profile_photo,
            'profile_photo_url' => $this->profile_photo_url,
            'sponsor_id' => $this->sponsor_id,
            'team' => $this->team,
            'package' => $this->whenLoaded('package'),
            'wallet' => $this->whenLoaded('wallet'),
            'current_rank' => $this->whenLoaded('currentRank', fn () => $this->currentRank->first()),
            'is_active' => $this->is_active,
            'is_verified' => $this->is_verified,
            'two_factor_enabled' => $this->two_factor_enabled,
            'country' => $this->country,
            'city' => $this->city,
            'created_at' => $this->created_at,
        ];
    }
}
