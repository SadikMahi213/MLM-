<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_ranks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('rank_id')->constrained('ranks')->onDelete('cascade');
            $table->boolean('is_current')->default(true);
            $table->timestamp('achieved_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'rank_id']);
            $table->index('is_current');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_ranks');
    }
};
