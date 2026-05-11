<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserRank extends Pivot
{
    protected $table = 'user_ranks';

    protected $fillable = [
        'user_id', 'rank_id', 'is_current', 'achieved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'achieved_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rank()
    {
        return $this->belongsTo(Rank::class);
    }
}
