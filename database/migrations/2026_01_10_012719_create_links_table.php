<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique();
            $table->string('title');
            $table->longText('subtitle')->nullable();
            $table->string('url')->nullable();
            $table->uuid('linkable_id')->nullable();
            $table->string('linkable_type')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('title', 'title_index');
            $table->index('url', 'url_index');
            $table->index(['linkable_id', 'linkable_type'], 'linkable_index');
            $table->fullText(['title', 'url'], 'fulltext_title_url');
            $table->unique(['title', 'linkable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
