<?php

namespace Database\Seeders;

use App\Models\Attribute;
use Illuminate\Database\Seeder;

class AttributesSeeder extends Seeder
{
    public function run(): void
    {
        $defaultAttributes = [
           
        ];

        $metaAttributes = [
            ['name' => 'Meta Title', 'key' => 'meta_title'],
            ['name' => 'Meta Description', 'key' => 'meta_description'],
            ['name' => 'Meta Keywords', 'key' => 'meta_keywords'],
            ['name' => 'Open Graph Title', 'key' => 'og_title'],
            ['name' => 'Open Graph Description', 'key' => 'og_description'],
            ['name' => 'Open Graph Image', 'key' => 'og_image'],
            ['name' => 'Open Graph Type', 'key' => 'og_type'],
            ['name' => 'Canonical URL', 'key' => 'canonical_url'],
        ];

        $attributes = array_merge($defaultAttributes, $metaAttributes);

        foreach ($attributes as $data) {
            Attribute::firstOrCreate(['key' => $data['key']], $data);
        }
    }
}
