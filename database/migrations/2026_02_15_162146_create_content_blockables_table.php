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
        Schema::create('content_blockables', function (Blueprint $table) {
            $table->uuidMorphs('content_blockable', 'cb_morph_index');
            $table->integer('order')->default(0);
            $table->string('key')->nullable();
            $table->boolean('is_visible')->default(true);

            $table->foreignUuid('content_block_id')->constrained('content_blocks')->cascadeOnDelete();
            $table->unique(['content_blockable_id', 'content_blockable_type', 'key'], 'cb_unique_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_blockables');
    }
};
