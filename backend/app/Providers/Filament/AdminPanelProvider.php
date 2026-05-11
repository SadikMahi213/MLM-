<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Dashboard;
use App\Filament\Pages\Reports;
use App\Filament\Widgets\AdminStatsOverviewWidget;
use App\Filament\Widgets\RecentLoginsWidget;
use App\Filament\Widgets\RecentRegistrationsWidget;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Navigation\NavigationItem;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Assets\Css;
use Filament\Support\Colors\Color;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\HtmlString;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->brandName('MLM Pro')
            ->colors([
                'primary' => Color::Blue,
            ])
            ->font('Inter')
            ->favicon(asset('favicon.ico'))
            ->defaultThemeMode(ThemeMode::Dark)
            ->pages([
                Dashboard::class,
                Reports::class,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->navigationGroups([
                NavigationGroup::make('Dashboard')->collapsed(false),
                NavigationGroup::make('User Management')->collapsed(false),
                NavigationGroup::make('Finance')->collapsed(false),
                NavigationGroup::make('Shop')->collapsed(false),
                NavigationGroup::make('Reports')->collapsed(false),
                NavigationGroup::make('Settings')->collapsed(true),
                NavigationGroup::make('System')->collapsed(true),
            ])
            ->widgets([
                AccountWidget::class,
                AdminStatsOverviewWidget::class,
                RecentRegistrationsWidget::class,
                RecentLoginsWidget::class,
                FilamentInfoWidget::class,
            ])
            ->assets([
                Css::make('admin-custom', 'css/admin-custom.css')
                    ->relativePublicPath('css/admin-custom.css'),
                Css::make('app-tailwind')
                    ->html(new HtmlString('<link rel="stylesheet" href="' . Vite::asset('resources/css/app.css') . '" data-navigate-track />')),
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
