<?php
namespace App\Models;

use App\Services\SettingsService;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'type', 'is_public', 'description'];

    protected static function booted(): void
    {
        static::saved(fn () => app(SettingsService::class)->flush());
        static::deleted(fn () => app(SettingsService::class)->flush());
    }

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default,
            'number' => is_numeric($setting->value) ? (float) $setting->value : $default,
            'json' => json_decode($setting->value, true) ?? $default,
            default => (string) $setting->value,
        };
    }

    public static function setValue(string $key, mixed $value, string $group = 'general'): self
    {
        $type = match (true) {
            is_bool($value) => 'boolean',
            is_numeric($value) => 'number',
            is_array($value) || is_object($value) => 'json',
            default => 'string',
        };

        $value = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group, 'type' => $type]
        );
    }
}
