<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // referral, binary, generation, daily_income
            $table->unsignedTinyInteger('level')->default(1);
            $table->decimal('percentage', 5, 2);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['type', 'level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_rules');
    }
};
