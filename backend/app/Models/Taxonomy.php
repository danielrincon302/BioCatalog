<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Taxonomy extends Model
{
    use HasFactory;

    protected $table = 'taxonomies';

    public $timestamps = false;

    protected $fillable = [
        'kingdom',
        'phylum',
        'class',
        'order',
        'family',
        'genus',
        'species',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function item(): HasOne
    {
        return $this->hasOne(Item::class, 'id_taxonomy');
    }

    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->genus,
            $this->species,
        ]);

        return implode(' ', $parts);
    }
}
