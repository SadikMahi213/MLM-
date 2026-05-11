<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('type');
            $table->decimal('amount', 18, 8)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('credited_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
