<?php

namespace Tests\Feature\Filament;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolePermissionSeeder']);
    }

    public function test_super_admin_can_access_admin_panel(): void
    {
        $user = User::factory()->create(['email' => 'super@mlmpro.com']);
        $user->assignRole('Super Admin');

        $this->assertTrue($user->canAccessPanel(app(\Filament\Panel::class)));
    }

    public function test_finance_admin_can_access_admin_panel(): void
    {
        $user = User::factory()->create(['email' => 'finance@mlmpro.com']);
        $user->assignRole('Finance Admin');

        $this->assertTrue($user->canAccessPanel(app(\Filament\Panel::class)));
    }

    public function test_support_admin_can_access_admin_panel(): void
    {
        $user = User::factory()->create(['email' => 'support@mlmpro.com']);
        $user->assignRole('Support Admin');

        $this->assertTrue($user->canAccessPanel(app(\Filament\Panel::class)));
    }

    public function test_regular_user_cannot_access_admin_panel(): void
    {
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->assertFalse($user->canAccessPanel(app(\Filament\Panel::class)));
    }

    public function test_super_admin_has_all_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        $this->assertTrue($user->can('view users'));
        $this->assertTrue($user->can('create users'));
        $this->assertTrue($user->can('edit users'));
        $this->assertTrue($user->can('view reports'));
        $this->assertTrue($user->can('export reports'));
        $this->assertTrue($user->can('view audit logs'));
    }

    public function test_finance_admin_has_finance_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Finance Admin');

        $this->assertTrue($user->can('view withdrawals'));
        $this->assertTrue($user->can('approve withdrawals'));
        $this->assertTrue($user->can('view wallets'));
        $this->assertTrue($user->can('credit wallets'));
        $this->assertFalse($user->can('create users'));
        $this->assertFalse($user->can('view audit logs'));
    }

    public function test_support_admin_has_support_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Support Admin');

        $this->assertTrue($user->can('view users'));
        $this->assertTrue($user->can('edit users'));
        $this->assertTrue($user->can('view orders'));
        $this->assertFalse($user->can('approve withdrawals'));
        $this->assertFalse($user->can('view audit logs'));
    }
}
