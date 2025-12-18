<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    public function run(): void
    {
        $collections = [
            ['name' => 'Amphibians', 'description' => 'Amphibian collection', 'display_order' => 1],
            ['name' => 'Birds', 'description' => 'Bird collection', 'display_order' => 2],
            ['name' => 'Invertebrates', 'description' => 'Invertebrate collection', 'display_order' => 3],
            ['name' => 'Mammals', 'description' => 'Mammal collection', 'display_order' => 4],
            ['name' => 'Fish', 'description' => 'Fish collection', 'display_order' => 5],
            ['name' => 'Herbarium', 'description' => 'Plant and herbarium collection', 'display_order' => 6],
            ['name' => 'Reptiles', 'description' => 'Reptile collection', 'display_order' => 7],
            ['name' => 'Phytoliths', 'description' => 'Phytolith collection', 'display_order' => 8],
        ];

        foreach ($collections as $collection) {
            Collection::updateOrCreate(
                ['name' => $collection['name']],
                $collection
            );
        }
    }
}
