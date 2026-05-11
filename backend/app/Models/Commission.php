<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'user_id', 'from_user_id', 'type', 'amount',
        'percentage', 'status', 'description', 'metadata', 'credited_at'
    ];

    protected $casts = [
        'amount' => 'decimal:8',
        'percentage' => 'decimal:2',
        'metadata' => 'array',
        'credited_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }
}
