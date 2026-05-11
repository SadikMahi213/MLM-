<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'subtotal', 'shipping_cost', 'tax',
        'total', 'status', 'payment_method', 'payment_status',
        'shipping_address', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:8',
            'shipping_cost' => 'decimal:8',
            'tax' => 'decimal:8',
            'total' => 'decimal:8',
        ];
    }

    public static function boot(): void
    {
        parent::boot();
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(\Str::random(8)) . '-' . now()->format('Ymd');
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price', 'total')
            ->withTimestamps();
    }
}
