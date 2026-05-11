<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'type', 'price', 'daily_income', 'binary_bonus_percent',
        'referral_bonus_percent', 'generation_bonus_percent',
        'duration_days', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:8',
        'daily_income' => 'decimal:8',
        'binary_bonus_percent' => 'decimal:2',
        'referral_bonus_percent' => 'decimal:2',
        'generation_bonus_percent' => 'decimal:2',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
