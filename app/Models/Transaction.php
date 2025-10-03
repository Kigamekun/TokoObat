<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_code',
        'customer_name',
        'customer_phone',
        'discount_type',
        'discount_value',
        'subtotal',
        'total',
        'user_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'discount_value' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            // Generate transaction code if not provided
            if (empty($transaction->transaction_code)) {
                $transaction->transaction_code = static::generateTransactionCode();
            }
        });
    }

    public static function generateTransactionCode()
    {
        $prefix = 'TXN';
        $date = now()->format('Ymd');

        // Get the last transaction code for today
        $lastTransaction = static::where('transaction_code', 'like', "{$prefix}{$date}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastTransaction) {
            $lastNumber = (int) substr($lastTransaction->transaction_code, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . $date . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
