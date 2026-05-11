<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        // Handle file upload for profile_photo
        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo');
        }

        // Set default free package if none selected
        if (empty($data['package_id'])) {
            $freePackage = \App\Models\Package::where('type', 'free')->first();
            if ($freePackage) {
                $data['package_id'] = $freePackage->id;
            }
        }

        $user = $this->authService->register($data);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => new UserResource($user->load('wallet', 'package')),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($result['user']->load('wallet', 'package')),
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('wallet', 'package', 'binaryPosition', 'sponsor', 'currentRank'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|unique:users,phone,' . $user->id,
            'telecom_code' => 'sometimes|string|max:10',
            'avatar' => 'sometimes|string|max:255',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'country' => 'sometimes|string|max:100',
            'city' => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:500',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:male,female,other',
            'team' => 'sometimes|in:A,B',
            'package_id' => 'sometimes|exists:packages,id',
        ]);

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo
            if ($user->profile_photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo);
            }
            $validated['profile_photo'] = $request->file('profile_photo')->store('avatars', 'public');
        }

        $user->update($validated);

        return new UserResource($user->load('wallet', 'package', 'currentRank'));
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function sendOTP(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiry = config('mlm.security.otp_expiry', 5);

        Cache::put("otp_{$request->user()->id}", $otp, now()->addMinutes($expiry));

        // In production, send via SMS gateway
        \Log::info("OTP for user {$request->user()->id}: {$otp}");

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function verifyOTP(Request $request)
    {
        $request->validate(['otp' => 'required|string|size:6']);

        $verified = $this->authService->verifyOTP($request->user(), $request->otp);

        if (!$verified) {
            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        return response()->json(['message' => 'Phone verified successfully']);
    }

    public function enable2FA(Request $request)
    {
        $secret = $this->authService->enable2FA($request->user());

        return response()->json([
            'message' => '2FA enabled successfully',
            'secret' => $secret,
        ]);
    }

    public function verify2FA(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $verified = $this->authService->verify2FA($request->user(), $request->code);

        if (!$verified) {
            return response()->json(['message' => 'Invalid 2FA code'], 422);
        }

        return response()->json(['message' => '2FA verified successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // In production, send password reset email
        \Log::info("Password reset requested for: {$request->email}");

        return response()->json(['message' => 'Password reset link sent to your email']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // In production, verify reset token and update password

        return response()->json(['message' => 'Password reset successfully']);
    }
}
