<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'created_at' => 'datetime',
    ];

    // Role constants
    public const SUPER_ADMIN = 1;
    public const ADMIN = 2;
    public const EDITOR = 3;

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_role');
    }
}
