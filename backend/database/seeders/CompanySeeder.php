<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::updateOrCreate(
            ['name' => 'MyNeighborhood'],
            [
                'name' => 'MyNeighborhood',
                'tax_id' => '000000000-0',
                'address' => 'Main address',
                'email' => 'info@myneighborhood.com',
                'active' => true,
            ]
        );
    }
}
