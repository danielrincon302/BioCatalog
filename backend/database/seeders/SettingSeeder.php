<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'catalog_title',
                'value' => 'Catálogo de Biodiversidad',
                'type' => 'text',
            ],
            [
                'key' => 'catalog_title_en',
                'value' => 'Biodiversity Catalog',
                'type' => 'text',
            ],
            [
                'key' => 'favicon_url',
                'value' => null,
                'type' => 'image',
            ],
            [
                'key' => 'logo_url',
                'value' => null,
                'type' => 'image',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
