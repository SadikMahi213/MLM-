<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\WithdrawalController;
use App\Http\Controllers\Api\BinaryController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DailyTaskController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/settings', [SettingsController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/settings/flush', [SettingsController::class, 'flush']);

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/send-otp', [AuthController::class, 'sendOTP']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOTP']);
    Route::post('/auth/2fa/enable', [AuthController::class, 'enable2FA']);
    Route::post('/auth/2fa/verify', [AuthController::class, 'verify2FA']);

    Route::get('/profile', [ProfileController::class, 'index']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::get('/wallet/history', [WalletController::class, 'history']);
    Route::post('/wallet/deposit', [WalletController::class, 'deposit']);

    Route::get('/withdrawals', [WithdrawalController::class, 'index']);
    Route::post('/withdrawals', [WithdrawalController::class, 'store']);
    Route::get('/withdrawals/{id}', [WithdrawalController::class, 'show']);
    Route::post('/withdrawals/{id}/cancel', [WithdrawalController::class, 'cancel']);

    Route::get('/binary/tree', [BinaryController::class, 'index']);
    Route::get('/binary/genealogy', [BinaryController::class, 'genealogy']);
    Route::get('/binary/stats', [BinaryController::class, 'stats']);

    Route::get('/commissions', [CommissionController::class, 'index']);
    Route::get('/commissions/summary', [CommissionController::class, 'summary']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::get('/daily-tasks', [DailyTaskController::class, 'index']);
    Route::post('/daily-tasks/{id}/complete', [DailyTaskController::class, 'complete']);
    Route::post('/daily-tasks/{id}/claim', [DailyTaskController::class, 'claimReward']);

    // Admin routes
    Route::post('/admin/impersonate/{user}', [AdminController::class, 'impersonate']);
});
