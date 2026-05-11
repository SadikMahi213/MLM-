<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('binary_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('position')->nullable();
            $table->string('path')->nullable();
            $table->integer('level')->default(0);
            $table->decimal('left_bv', 18, 8)->default(0);
            $table->decimal('right_bv', 18, 8)->default(0);
            $table->decimal('carry_forward_left', 18, 8)->default(0);
            $table->decimal('carry_forward_right', 18, 8)->default(0);
            $table->integer('total_left_members')->default(0);
            $table->integer('total_right_members')->default(0);
            $table->integer('active_left_members')->default(0);
            $table->integer('active_right_members')->default(0);
            $table->timestamps();

            $table->index('parent_id');
            $table->index('path');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('binary_positions');
    }
};
