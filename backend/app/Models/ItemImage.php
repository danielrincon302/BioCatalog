<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemImage extends Model
{
    use HasFactory;

    protected $table = 'item_images';

    public $timestamps = false;

    protected $fillable = [
        'id_item',
        'file_url',
        'description',
        'image_date',
        'display_order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'image_date' => 'date',
        'created_at' => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'id_item');
    }
}
