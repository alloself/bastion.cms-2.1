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
        Schema::create('data_collections', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('name');
            $table->json('meta')->nullable();
            $table->bigInteger('order')->default(0);
            $table->unsignedInteger('_lft')->default(0);
            $table->unsignedInteger('_rgt')->default(0);
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('data_collections');

            $table->foreignUuid('template_id')->nullable()->constrained();
            $table->foreignUuid('page_id')->nullable()->constrained();

            $table->index(['_lft', '_rgt'], 'nested_set_idx');
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
        Schema::dropIfExists('data_collections');
    }
};
