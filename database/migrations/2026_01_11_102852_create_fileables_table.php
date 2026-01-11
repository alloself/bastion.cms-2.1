<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fileables', function (Blueprint $table) {
            $table->uuidMorphs('fileable');
            $table->enum('type', ['image', 'video', 'file']);
            $table->string('key')->nullable();
            $table->integer('order')->default(0);

            $table->foreignUuid('file_id')->constrained();
            $table->unique(['fileable_id', 'fileable_type', 'key']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('fileables');
    }
};
