<?php

namespace App\Filament\Traits;

use Illuminate\Support\Facades\Auth;

trait HasAdminPermissions
{
    public static function canViewAny(): bool
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }
        if ($user->hasRole('Super Admin')) {
            return true;
        }
        $permission = static::getRequiredPermission();
        return $permission ? $user->can($permission) : true;
    }

    protected static function getRequiredPermission(): ?string
    {
        $map = [
            'UserResource' => 'view users',
            'DeviceSessionResource' => 'view users',
            'WalletResource' => 'view wallets',
            'WithdrawalResource' => 'view withdrawals',
            'CommissionResource' => 'view commissions',
            'WalletTransactionResource' => 'view wallets',
            'OrderResource' => 'view orders',
            'ProductResource' => 'view products',
            'PackageResource' => 'view packages',
            'RankResource' => 'view ranks',
            'DailyTaskResource' => 'view daily tasks',
            'SettingResource' => 'view settings',
            'AuditLogResource' => 'view audit logs',
            'CommissionRuleResource' => 'view commission rules',
        ];

        $short = (new \ReflectionClass(static::class))->getShortName();
        return $map[$short] ?? null;
    }
}
