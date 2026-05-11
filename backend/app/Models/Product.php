<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'price', 'compare_price', 'category',
        'images', 'stock', 'sku', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:8',
            'compare_price' => 'decimal:8',
            'images' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('quantity', 'price', 'total')
            ->withTimestamps();
    }
}
