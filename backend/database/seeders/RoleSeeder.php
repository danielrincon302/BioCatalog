<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'id' => 1,
                'name' => 'Super Administrator',
                'description' => 'Full system access',
                'active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Administrator',
                'description' => 'User and content management for their company',
                'active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Editor',
                'description' => 'Creation and editing of own items',
                'active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['id' => $role['id']], $role);
        }
    }
}
