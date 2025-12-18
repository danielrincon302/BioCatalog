<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->enum('type', ['COUNTRY', 'CITY', 'NEIGHBORHOOD']);
            $table->string('postal_code', 20)->nullable();
            $table->foreignId('id_parent_location')->nullable()->constrained('locations')->onDelete('cascade');
            $table->boolean('active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
