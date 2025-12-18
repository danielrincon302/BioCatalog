<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_collection')->constrained('collections')->onDelete('restrict');
            $table->foreignId('id_company')->constrained('companies')->onDelete('cascade');
            $table->foreignId('id_user')->constrained('users')->onDelete('restrict');
            $table->foreignId('id_location')->nullable()->constrained('locations')->onDelete('set null');
            $table->foreignId('id_taxonomy')->nullable()->constrained('taxonomies')->onDelete('set null');
            $table->string('scientific_name', 200);
            $table->string('common_name', 200)->nullable();
            $table->string('slug', 250)->unique();
            $table->text('description')->nullable();
            $table->text('history')->nullable();
            $table->text('notes')->nullable();
            $table->string('location_detail', 500)->nullable();
            $table->string('coordinates', 100)->nullable();
            $table->integer('quantity')->default(1);
            $table->date('planting_date')->nullable();
            $table->date('germination_date')->nullable();
            $table->string('additional_info_url', 500)->nullable();
            $table->enum('status', ['VISIBLE', 'NOT_VISIBLE'])->default('VISIBLE');
            $table->timestamps();

            $table->index('id_collection');
            $table->index('id_company');
            $table->index('id_user');
            $table->index('status');
            $table->index('scientific_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
