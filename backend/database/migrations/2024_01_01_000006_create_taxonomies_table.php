<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taxonomies', function (Blueprint $table) {
            $table->id();
            $table->string('kingdom', 100)->nullable();
            $table->string('phylum', 100)->nullable();
            $table->string('class', 100)->nullable();
            $table->string('order', 100)->nullable();
            $table->string('family', 100)->nullable();
            $table->string('genus', 100)->nullable();
            $table->string('species', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taxonomies');
    }
};
