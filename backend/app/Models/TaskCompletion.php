<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskCompletion extends Model
{
    protected $fillable = ['user_id', 'daily_task_id', 'completed_date', 'reward_claimed', 'claimed_at'];

    protected $casts = [
        'reward_claimed' => 'boolean',
        'completed_date' => 'date',
        'claimed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dailyTask()
    {
        return $this->belongsTo(DailyTask::class);
    }
}
