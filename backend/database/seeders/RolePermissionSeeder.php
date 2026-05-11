<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'view users', 'create users', 'edit users', 'delete users', 'impersonate users',
            'view wallets', 'credit wallets', 'debit wallets',
            'view withdrawals', 'approve withdrawals', 'reject withdrawals',
            'view commissions',
            'view packages', 'create packages', 'edit packages', 'delete packages',
            'view products', 'create products', 'edit products', 'delete products',
            'view orders', 'create orders', 'edit orders', 'delete orders',
            'view ranks', 'create ranks', 'edit ranks', 'delete ranks',
            'view daily tasks', 'create daily tasks', 'edit daily tasks', 'delete daily tasks',
            'view settings', 'create settings', 'edit settings', 'delete settings',
            'view audit logs',
            'view reports', 'export reports',
            'view notifications', 'send notifications',
            'view commission rules', 'create commission rules', 'edit commission rules', 'delete commission rules',
            'view import',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        $financeAdmin = Role::firstOrCreate(['name' => 'Finance Admin', 'guard_name' => 'web']);
        $financeAdmin->syncPermissions([
            'view users', 'view wallets', 'credit wallets', 'debit wallets',
            'view withdrawals', 'approve withdrawals', 'reject withdrawals',
            'view commissions',
            'view packages', 'view products', 'view orders',
            'view reports', 'export reports',
        ]);

        $supportAdmin = Role::firstOrCreate(['name' => 'Support Admin', 'guard_name' => 'web']);
        $supportAdmin->syncPermissions([
            'view users', 'edit users', 'impersonate users',
            'view wallets',
            'view withdrawals',
            'view commissions',
            'view packages', 'view products', 'view orders',
            'view daily tasks',
            'view notifications', 'send notifications',
        ]);

        $adminUser = User::where('email', 'admin@mlmpro.com')->first();
        if ($adminUser) {
            $adminUser->assignRole('Super Admin');
        }

        $users = User::where('email', 'like', '%@mlmpro.com')->get();
        foreach ($users as $user) {
            if (!$user->hasAnyRole(['Super Admin', 'Finance Admin', 'Support Admin'])) {
                $user->assignRole('Support Admin');
            }
        }
    }
}
