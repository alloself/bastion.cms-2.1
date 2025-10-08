<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class RolesAndUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rootRole = Role::findOrCreate('root', 'web');
        $editorRole = Role::findOrCreate('editor', 'web');
        $userRole = Role::findOrCreate('user', 'web');

        $root = User::firstOrCreate(
            ['email' => 'root@example.com'],
            [
                'password' => 'root',
            ]
        );
        $root->assignRole($rootRole);

        $editor = User::firstOrCreate(
            ['email' => 'editor@example.com'],
            [
                'password' => 'editor',
            ]
        );
        $editor->assignRole($editorRole);

        $basic = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'password' => 'user',
            ]
        );
        $basic->assignRole($userRole);
    }
}
