<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
use HasFactory;

protected $fillable = [
'medicine_id','medicine_batch_id','type','quantity','ref','note','user_id'
];

public function medicine()
{
return $this->belongsTo(Medicine::class);
}

public function batch()
{
return $this->belongsTo(MedicineBatch::class, 'medicine_batch_id');
}
}
