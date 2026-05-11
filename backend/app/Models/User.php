<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->hasRole(['Super Admin', 'Finance Admin', 'Support Admin']) || str_ends_with($this->email, '@mlmpro.com');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['Super Admin', 'Finance Admin', 'Support Admin']) || str_ends_with($this->email, '@mlmpro.com');
    }

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'username', 'sponsor_id',
        'package_id', 'is_active', 'is_verified', 'two_factor_enabled',
        'two_factor_secret', 'avatar', 'profile_photo', 'country', 'city', 'address',
        'date_of_birth', 'gender', 'last_login_at', 'last_login_ip',
        'email_verified_at', 'phone_verified_at',
        'telecom_code', 'team',
    ];

    protected $hidden = [
        'password', 'remember_token', 'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'date_of_birth' => 'date',
            'last_login_at' => 'datetime',
        ];
    }

    protected $appends = ['profile_photo_url'];

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        if ($this->avatar) {
            return $this->avatar;
        }
        return null;
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function sponsor()
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function binaryPosition()
    {
        return $this->hasOne(BinaryPosition::class);
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'sponsor_id');
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function deviceSessions()
    {
        return $this->hasMany(DeviceSession::class);
    }

    public function currentRank()
    {
        return $this->belongsToMany(Rank::class, 'user_ranks')
            ->wherePivot('is_current', true)
            ->withPivot('achieved_at')
            ->withTimestamps();
    }

    public function ranks()
    {
        return $this->belongsToMany(Rank::class, 'user_ranks')
            ->withPivot('is_current', 'achieved_at')
            ->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
