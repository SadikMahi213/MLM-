<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (file_exists($helpers = app_path('helpers.php'))) {
            require_once $helpers;
        }
    }

    public function boot(): void
    {
        //
    }
}
