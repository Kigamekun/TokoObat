<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'stock',
        'min_stock',
        'unit',
        'img',
        'expiration_date',
        'description',
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function getStatusAttribute()
    {
        $today = now();
        $expiration = $this->expiration_date;

        if ($expiration < $today) {
            return 'expired';
        } elseif ($expiration->diffInDays($today) <= 30) {
            return 'expiring';
        } elseif ($this->stock <= $this->min_stock) {
            return 'low-stock';
        } else {
            return 'available';
        }
    }
}
