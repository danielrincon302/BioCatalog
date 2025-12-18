<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_qr_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_item')->unique()->constrained('items')->onDelete('cascade');
            $table->string('qr_image_url', 500)->nullable();
            $table->string('barcode_number', 100)->unique()->nullable();
            $table->string('barcode_image_url', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_qr_images');
    }
};
