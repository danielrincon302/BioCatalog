<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_collection', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_company')->constrained('companies')->onDelete('cascade');
            $table->foreignId('id_collection')->constrained('collections')->onDelete('cascade');
            $table->boolean('visible')->default(true);
            $table->timestamps();

            $table->unique(['id_company', 'id_collection']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_collection');
    }
};
