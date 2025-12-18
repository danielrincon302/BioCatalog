<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('name', 'MyNeighborhood')->first();

        if ($company) {
            User::updateOrCreate(
                ['email' => 'admin'],
                [
                    'id_company' => $company->id,
                    'id_role' => Role::SUPER_ADMIN,
                    'name' => 'Administrator',
                    'email' => 'admin',
                    'password' => Hash::make('admin123'),
                    'active' => true,
                ]
            );
        }
    }
}
