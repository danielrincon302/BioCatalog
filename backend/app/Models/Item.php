<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Item extends Model
{
    use HasFactory;

    protected $table = 'items';

    protected $fillable = [
        'id_collection',
        'id_company',
        'id_user',
        'id_location',
        'id_taxonomy',
        'scientific_name',
        'common_name',
        'slug',
        'description',
        'history',
        'notes',
        'location_detail',
        'coordinates',
        'quantity',
        'planting_date',
        'germination_date',
        'additional_info_url',
        'status',
    ];

    protected $casts = [
        'planting_date' => 'date',
        'germination_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->slug)) {
                $item->slug = $item->generateSlug();
            }
        });

        static::updating(function ($item) {
            if ($item->isDirty('scientific_name')) {
                $item->slug = $item->generateSlug();
            }
        });
    }

    public function generateSlug(): string
    {
        $base = Str::slug($this->scientific_name);
        $slug = $base;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class, 'id_collection');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'id_company');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'id_location');
    }

    public function taxonomy(): BelongsTo
    {
        return $this->belongsTo(Taxonomy::class, 'id_taxonomy');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ItemImage::class, 'id_item')->orderBy('display_order');
    }

    public function qrImage(): HasOne
    {
        return $this->hasOne(ItemQrImage::class, 'id_item');
    }

    public function getPublicUrlAttribute(): string
    {
        return url("/catalog/{$this->slug}");
    }

    public function isVisible(): bool
    {
        return $this->status === 'VISIBLE';
    }

    public function scopeVisible($query)
    {
        return $query->where('status', 'VISIBLE');
    }

    public function scopeByCollection($query, $collectionId)
    {
        return $query->where('id_collection', $collectionId);
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('id_company', $companyId);
    }
}
