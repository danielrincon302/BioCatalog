<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'id_company',
        'id_role',
        'name',
        'email',
        'mobile',
        'whatsapp',
        'avatar_url',
        'password',
        'last_access',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'active' => 'boolean',
        'last_access' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'id_company');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role');
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'id_user');
    }

    // Role verification helpers
    public function isSuperAdmin(): bool
    {
        return $this->id_role === Role::SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->id_role === Role::ADMIN;
    }

    public function isEditor(): bool
    {
        return $this->id_role === Role::EDITOR;
    }

    public function canEditItem(Item $item): bool
    {
        // Super Admin and Admin can edit any item
        if ($this->isSuperAdmin() || $this->isAdmin()) {
            return true;
        }

        // Editor can only edit their own items
        return $this->id === $item->id_user;
    }

    public function canDeleteItem(Item $item): bool
    {
        return $this->canEditItem($item);
    }
}
