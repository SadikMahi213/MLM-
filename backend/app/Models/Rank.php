<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rank extends Model
{
    protected $fillable = [
        'name', 'level', 'min_direct_referrals', 'min_team_members',
        'min_active_team', 'min_team_bv', 'bonus_percent', 'icon',
        'description', 'benefits', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_team_bv' => 'decimal:8',
            'bonus_percent' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_ranks')
            ->withPivot('is_current', 'achieved_at')
            ->withTimestamps();
    }

    public function activeUsers()
    {
        return $this->users()->wherePivot('is_current', true);
    }
}
