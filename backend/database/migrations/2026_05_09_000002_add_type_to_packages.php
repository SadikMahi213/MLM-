<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('type', 20)->default('paid')->after('name')->comment('free or paid');
        });

        // Mark any package with price=0 as 'free'
        \DB::table('packages')->where('price', 0)->update(['type' => 'free']);
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
