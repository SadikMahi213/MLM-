<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BinaryPosition extends Model
{
    protected $fillable = [
        'user_id', 'parent_id', 'position', 'path', 'level',
        'left_bv', 'right_bv', 'carry_forward_left', 'carry_forward_right',
        'total_left_members', 'total_right_members',
        'active_left_members', 'active_right_members'
    ];

    protected $casts = [
        'left_bv' => 'decimal:8',
        'right_bv' => 'decimal:8',
        'carry_forward_left' => 'decimal:8',
        'carry_forward_right' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function getLeftLeg()
    {
        return static::where('parent_id', $this->user_id)->where('position', 'A')->first();
    }

    public function getRightLeg()
    {
        return static::where('parent_id', $this->user_id)->where('position', 'B')->first();
    }
}
