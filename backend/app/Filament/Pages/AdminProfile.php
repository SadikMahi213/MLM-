<?php

namespace App\Filament\Pages;

use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminProfile extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-user-circle';
    protected static string|\UnitEnum|null $navigationGroup = 'Dashboard';
    protected static ?int $navigationSort = -1;
    protected string $view = 'filament.pages.admin-profile';
    protected static ?string $slug = 'profile';

    public ?string $name = '';
    public ?string $email = '';
    public ?string $phone = '';

    public ?string $current_password = '';
    public ?string $new_password = '';
    public ?string $new_password_confirmation = '';

    public bool $two_factor_enabled = false;
    public string $two_factor_secret = '';

    public array $userData = [];

    public function mount(): void
    {
        $user = Auth::user();
        $this->name = $user->name;
        $this->email = $user->email;
        $this->phone = $user->phone ?? '';
        $this->two_factor_enabled = (bool) $user->two_factor_enabled;

        $this->userData = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? 'Not set',
            'avatar' => $user->profile_photo_url ?? $user->avatar ?? null,
            'initials' => $this->getInitials($user->name),
            'role' => $user->roles->pluck('name')->implode(', ') ?: 'Admin',
            'member_since' => $user->created_at->format('M d, Y'),
            'last_login' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'First login',
            'last_ip' => $user->last_login_ip ?? 'Unknown',
        ];
    }

    public function updateProfile(): void
    {
        $this->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . Auth::id(),
            'phone' => 'nullable|string|max:20',
        ]);

        Auth::user()->update([
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone ?: null,
        ]);

        $this->userData['name'] = $this->name;
        $this->userData['email'] = $this->email;
        $this->userData['initials'] = $this->getInitials($this->name);

        Notification::make()->title('Profile updated successfully')->success()->send();
    }

    public function updatePassword(): void
    {
        $this->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
        ]);

        Auth::user()->update([
            'password' => Hash::make($this->new_password),
        ]);

        $this->current_password = '';
        $this->new_password = '';
        $this->new_password_confirmation = '';

        Notification::make()->title('Password changed successfully')->success()->send();
    }

    public function enableTwoFactor(): void
    {
        $user = Auth::user();
        $secret = \Illuminate\Support\Str::random(32);

        $user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => Hash::make($secret),
        ]);

        $this->two_factor_enabled = true;
        $this->two_factor_secret = $secret;

        Notification::make()
            ->title('Two-Factor Authentication Enabled')
            ->body('Scan this secret with your authenticator app: ' . $secret)
            ->warning()
            ->persistent()
            ->send();
    }

    public function revokeSession(int $sessionId): void
    {
        $session = \App\Models\DeviceSession::where('user_id', Auth::id())->find($sessionId);

        if (!$session || $session->is_current) {
            Notification::make()->title('Cannot revoke the current session')->warning()->send();
            return;
        }

        $session->delete();

        Notification::make()->title('Session revoked successfully')->success()->send();
    }

    public function disableTwoFactor(): void
    {
        Auth::user()->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
        ]);

        $this->two_factor_enabled = false;
        $this->two_factor_secret = '';

        Notification::make()->title('Two-Factor Authentication Disabled')->success()->send();
    }

    private function getInitials(string $name): string
    {
        $parts = explode(' ', trim($name));
        $initials = '';
        foreach ($parts as $part) {
            if (!empty($part)) {
                $initials .= strtoupper($part[0]);
            }
        }
        return substr($initials, 0, 2);
    }

    public static function getNavigationLabel(): string
    {
        return 'Profile';
    }

    public function getTitle(): string
    {
        return 'Admin Profile & Security';
    }
}
