<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_fillable_attributes(): void
    {
        $user = User::factory()->create();
        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->email);
    }

    public function test_user_has_wallet_relationship(): void
    {
        $user = User::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $user->wallet());
    }

    public function test_user_has_commissions_relationship(): void
    {
        $user = User::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->commissions());
    }

    public function test_user_has_withdrawals_relationship(): void
    {
        $user = User::factory()->create();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->withdrawals());
    }

    public function test_user_can_be_active(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $this->assertTrue($user->is_active);
    }

    public function test_user_can_be_inactive(): void
    {
        $user = User::factory()->create(['is_active' => false]);
        $this->assertFalse($user->is_active);
    }
}
