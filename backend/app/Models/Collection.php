<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collection extends Model
{
    use HasFactory;

    protected $table = 'collections';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'icon_url',
        'display_order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'id_collection');
    }
}
