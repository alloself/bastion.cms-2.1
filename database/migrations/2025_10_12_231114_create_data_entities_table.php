<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_entities', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('name')->nullable();
            $table->json('meta')->nullable();
            $table->longText('content')->nullable();
            $table->integer('order')->default(0);
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('data_entities')->onDelete('cascade');

            $table->foreignUuid('template_id')->nullable()->constrained();
            
            $table->index('order');
            $table->index('name');
            $table->index('parent_id');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_entities');
    }
};
