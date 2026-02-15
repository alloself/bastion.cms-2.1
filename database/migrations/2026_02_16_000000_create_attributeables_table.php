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
        Schema::create('attributeables', function (Blueprint $table) {
            $table->uuidMorphs('attributeable', 'attr_morph_index');
            $table->text('value')->nullable();

            $table->foreignUuid('attribute_id')->constrained('attributes')->cascadeOnDelete();
            $table->unique(['attribute_id', 'attributeable_id', 'attributeable_type'], 'attr_unique_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attributeables');
    }
};
