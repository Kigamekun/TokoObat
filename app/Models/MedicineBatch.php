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
}
