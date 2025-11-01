<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineBatch extends Model
{
    protected $fillable = ['medicine_id', 'batch_code', 'qty', 'expiration_date'];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    protected $casts = [
        'expiration_date' => 'date',     // atau 'datetime'
        'received_at' => 'date',     // kalau punya kolom ini
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function movements()
    {
        return $this->hasMany(StockMovement::class, 'medicine_batch_id');
    }
}
