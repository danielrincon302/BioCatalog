<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_item')->constrained('items')->onDelete('cascade');
            $table->string('file_url', 500);
            $table->string('description', 300)->nullable();
            $table->date('image_date')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('id_item');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_images');
    }
};
