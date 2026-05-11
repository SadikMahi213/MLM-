<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 18, 8)->default(0);
            $table->decimal('compare_price', 18, 8)->nullable()->comment('Original price for discount display');
            $table->string('category', 100)->nullable();
            $table->json('images')->nullable();
            $table->integer('stock')->default(0);
            $table->string('sku', 100)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
