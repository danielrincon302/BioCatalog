<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $table = 'companies';

    protected $fillable = [
        'name',
        'tax_id',
        'address',
        'phone',
        'email',
        'logo_url',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_company');
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'id_company');
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'company_collection', 'id_company', 'id_collection')
            ->withPivot('visible')
            ->withTimestamps();
    }

    public function visibleCollections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'company_collection', 'id_company', 'id_collection')
            ->withPivot('visible')
            ->wherePivot('visible', true);
    }
}
