<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceSession extends Model
{
    protected $fillable = [
        'user_id', 'device_name', 'device_type', 'platform', 'browser',
        'ip_address', 'user_agent', 'location', 'is_current', 'last_activity'
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'last_activity' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
