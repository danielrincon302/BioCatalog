<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_company')->constrained('companies')->onDelete('cascade');
            $table->foreignId('id_role')->default(3)->constrained('roles')->onDelete('restrict');
            $table->string('name', 200);
            $table->string('email', 150)->unique();
            $table->string('mobile', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->string('password');
            $table->timestamp('last_access')->nullable();
            $table->boolean('active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
