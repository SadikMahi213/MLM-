<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('order_number', 50)->unique();
            $table->decimal('subtotal', 18, 8)->default(0);
            $table->decimal('shipping_cost', 18, 8)->default(0);
            $table->decimal('tax', 18, 8)->default(0);
            $table->decimal('total', 18, 8)->default(0);
            $table->string('status', 50)->default('pending')->comment('pending, processing, completed, cancelled, refunded');
            $table->string('payment_method', 100)->nullable();
            $table->string('payment_status', 50)->default('pending')->comment('pending, paid, failed, refunded');
            $table->text('shipping_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('order_number');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 18, 8)->default(0);
            $table->decimal('total', 18, 8)->default(0);
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
