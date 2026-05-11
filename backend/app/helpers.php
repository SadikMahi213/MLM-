<?php

use App\Services\SettingsService;

if (!function_exists('setting')) {
    function setting(string $key, mixed $default = null): mixed
    {
        return SettingsService::make()->get($key, $default);
    }
}
