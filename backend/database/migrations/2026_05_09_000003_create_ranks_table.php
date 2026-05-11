<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ranks', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->integer('level')->unique();
            $table->integer('min_direct_referrals')->default(0);
            $table->integer('min_team_members')->default(0);
            $table->integer('min_active_team')->default(0);
            $table->decimal('min_team_bv', 18, 8)->default(0);
            $table->decimal('bonus_percent', 5, 2)->default(0);
            $table->string('icon', 255)->nullable();
            $table->text('description')->nullable();
            $table->text('benefits')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ranks');
    }
};
