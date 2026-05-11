<?php

namespace Tests\Unit\Services;

use App\Models\Commission;
use App\Models\User;
use App\Models\Wallet;
use App\Services\CommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_award_binary_bonus_creates_commission(): void
    {
        $user = User::factory()->create();
        Wallet::factory()->create(['user_id' => $user->id]);
        $service = app(CommissionService::class);

        $service->awardBinaryBonus($user, 100.00);

        $this->assertDatabaseHas('commissions', [
            'user_id' => $user->id,
            'type' => 'binary',
            'amount' => 100.00,
            'status' => 'credited',
        ]);
    }

    public function test_award_binary_bonus_credits_wallet(): void
    {
        $user = User::factory()->create();
        Wallet::factory()->create(['user_id' => $user->id, 'balance' => 0]);
        $initialBalance = $user->wallet->balance;

        $service = app(CommissionService::class);
        $service->awardBinaryBonus($user, 50.00);

        $this->assertEquals($initialBalance + 50.00, $user->wallet->fresh()->balance);
    }

    public function test_award_binary_bonus_creates_wallet_transaction(): void
    {
        $user = User::factory()->create();
        Wallet::factory()->create(['user_id' => $user->id]);
        $service = app(CommissionService::class);

        $service->awardBinaryBonus($user, 75.00);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $user->id,
            'type' => 'commission',
            'amount' => 75.00,
        ]);
    }
}
