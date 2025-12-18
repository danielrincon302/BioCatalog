<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemQrImage extends Model
{
    use HasFactory;

    protected $table = 'item_qr_images';

    protected $fillable = [
        'id_item',
        'qr_image_url',
        'barcode_number',
        'barcode_image_url',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'id_item');
    }
}
