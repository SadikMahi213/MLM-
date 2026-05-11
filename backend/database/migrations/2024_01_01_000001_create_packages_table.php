<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 18, 8)->default(0);
            $table->decimal('daily_income', 18, 8)->default(0);
            $table->decimal('binary_bonus_percent', 5, 2)->default(0);
            $table->decimal('referral_bonus_percent', 5, 2)->default(0);
            $table->decimal('generation_bonus_percent', 5, 2)->default(0);
            $table->integer('duration_days')->default(365);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
