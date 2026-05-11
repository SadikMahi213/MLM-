<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTask extends Model
{
    protected $fillable = ['title', 'description', 'reward', 'type', 'requirements', 'is_active'];

    protected $casts = [
        'reward' => 'decimal:8',
        'requirements' => 'array',
        'is_active' => 'boolean',
    ];

    public function completions()
    {
        return $this->hasMany(TaskCompletion::class);
    }
}
