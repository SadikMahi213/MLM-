<?php

namespace Tests\Unit;

use App\Models\Commission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_belongs_to_user(): void
    {
        $commission = Commission::factory()->create();
        $this->assertInstanceOf(User::class, $commission->user);
    }

    public function test_commission_has_types(): void
    {
        $types = ['binary', 'referral', 'generation', 'daily_task'];
        
        foreach ($types as $type) {
            $commission = Commission::factory()->create(['type' => $type]);
            $this->assertEquals($type, $commission->type);
        }
    }

    public function test_commission_has_statuses(): void
    {
        $statuses = ['pending', 'credited', 'failed'];
        
        foreach ($statuses as $status) {
            $commission = Commission::factory()->create(['status' => $status]);
            $this->assertEquals($status, $commission->status);
        }
    }

    public function test_commission_can_be_pending(): void
    {
        $commission = Commission::factory()->create(['status' => 'pending']);
        $this->assertEquals('pending', $commission->status);
    }

    public function test_commission_can_be_credited(): void
    {
        $commission = Commission::factory()->create(['status' => 'credited']);
        $this->assertEquals('credited', $commission->status);
    }
}
