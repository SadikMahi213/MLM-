<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telecom_code', 10)->nullable()->after('phone');
            $table->string('team', 5)->nullable()->after('package_id')->comment('A or B binary team');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telecom_code', 'team']);
        });
    }
};
