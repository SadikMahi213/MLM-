<?php
namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'mlm_settings_all';
    private const CACHE_TTL = 3600;

    private ?array $settings = null;

    public function __construct()
    {
        $this->load();
    }

    public function get(string $key, mixed $default = null): mixed
    {
        if (!isset($this->settings[$key])) {
            return $default;
        }
        return $this->settings[$key]['casted_value'];
    }

    public function getGroup(string $group): array
    {
        return array_filter($this->settings, fn ($setting) => $setting['group'] === $group);
    }

    public function getPublic(): array
    {
        return Setting::where('is_public', true)->get()->mapWithKeys(fn ($setting) => [
            $setting->key => Setting::getValue($setting->key),
        ])->toArray();
    }

    public function set(string $key, mixed $value, string $group = 'general'): void
    {
        Setting::setValue($key, $value, $group);
        $this->flush();
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
        $this->settings = null;
    }

    public function all(): array
    {
        return $this->getGrouped();
    }

    public function getGrouped(): array
    {
        $grouped = [];
        foreach ($this->settings as $key => $setting) {
            $grouped[$setting['group']][$key] = $setting['casted_value'];
        }
        return $grouped;
    }

    private function load(): void
    {
        $this->settings = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Setting::all()->mapWithKeys(fn ($setting) => [
                $setting->key => [
                    'value' => $setting->value,
                    'casted_value' => Setting::getValue($setting->key),
                    'group' => $setting->group,
                    'type' => $setting->type,
                ],
            ])->toArray();
        });
    }

    public static function make(): self
    {
        return app(static::class);
    }
}
