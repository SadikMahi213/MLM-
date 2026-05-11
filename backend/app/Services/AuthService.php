<?php
namespace App\Services;

use App\Models\User;
use App\Models\DeviceSession;
use App\Events\UserRegistered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private BinaryService $binaryService
    ) {}

    public function register(array $data): User
    {
        $sponsor = null;
        if (!empty($data['sponsor_code'])) {
            $sponsor = User::where('username', $data['sponsor_code'])->firstOrFail();
        }

        // Handle profile photo upload
        if (!empty($data['profile_photo']) && $data['profile_photo'] instanceof \Illuminate\Http\UploadedFile) {
            $data['profile_photo'] = $data['profile_photo']->store('avatars', 'public');
        } else {
            unset($data['profile_photo']);
        }

        $data['password'] = Hash::make($data['password']);

        // Sync team with binary position if provided
        if (empty($data['team']) && !empty($data['position'])) {
            $data['team'] = $data['position'];
        }

        $user = User::create($data);

        UserRegistered::dispatch($user, $sponsor, $data['position'] ?? null);

        return $user;
    }

    public function login(array $credentials): array
    {
        $login = $credentials['login'];
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $login)->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['Your account has been deactivated.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function verifyOTP(User $user, string $otp): bool
    {
        $cached = Cache::get("otp_{$user->id}");
        if (!$cached || $cached !== $otp) {
            return false;
        }

        Cache::forget("otp_{$user->id}");
        $user->update(['phone_verified_at' => now()]);

        return true;
    }

    public function enable2FA(User $user): string
    {
        $secret = \Str::random(32);
        $user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => Hash::make($secret),
        ]);

        return $secret;
    }

    public function verify2FA(User $user, string $code): bool
    {
        if (!$user->two_factor_enabled || !$user->two_factor_secret) {
            return false;
        }

        return Hash::check($code, $user->two_factor_secret);
    }

    public function logout(User $user, ?string $sessionId = null): void
    {
        if ($sessionId) {
            $user->tokens()->where('id', $sessionId)->delete();
        } else {
            $user->tokens()->delete();
        }
    }
}
