<?php

namespace App\Filament\Pages;

use App\Models\Package;
use App\Models\User;
use App\Models\Withdrawal;
use Filament\Actions\Action;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SystemHealth extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-heart';
    protected static string|\UnitEnum|null $navigationGroup = 'System';
    protected static ?int $navigationSort = 2;
    protected string $view = 'filament.pages.system-health';
    protected static ?string $slug = 'system-health';

    public array $health = [];
    public bool $refreshing = false;
    public ?string $lastRefreshed = null;

    public function mount(): void
    {
        $this->refreshHealth();
    }

    public function refreshHealth(): void
    {
        $this->refreshing = true;

        $this->health = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug'),
            'last_cron_run' => Cache::get('last_cron_run', 'Never'),
            'queue_connection' => config('queue.default'),
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'filesystem_driver' => config('filesystems.default'),
            'db_connection' => config('database.default'),
            'db_status' => $this->checkDatabase(),
            'cache_status' => $this->checkCache(),
            'storage_used' => $this->getStorageUsed(),
            'storage_free' => $this->getStorageFree(),
            'storage_total' => $this->getStorageTotal(),
            'storage_percent' => $this->getStoragePercent(),
            'user_count' => User::count(),
            'package_count' => Package::count(),
            'pending_withdrawals' => Withdrawal::where('status', 'pending')->count(),
            'failed_jobs' => $this->getFailedJobsCount(),
            'app_url' => config('app.url'),
            'app_name' => config('app.name'),
            'timezone' => config('app.timezone'),
            'server_time' => now()->format('Y-m-d H:i:s T'),
        ];

        $this->lastRefreshed = now()->format('H:i:s');
        $this->refreshing = false;
    }

    public function clearCache(): void
    {
        Artisan::call('optimize:clear');
        $this->refreshHealth();
        \Filament\Notifications\Notification::make()
            ->title('All caches cleared successfully')
            ->success()
            ->send();
    }

    public function runMigration(): void
    {
        Artisan::call('migrate', ['--force' => true]);
        $this->refreshHealth();
        \Filament\Notifications\Notification::make()
            ->title('Migrations ran successfully')
            ->success()
            ->send();
    }

    public function getAutoRefreshInterval(): int
    {
        return 60000;
    }

    private function checkDatabase(): string
    {
        try {
            DB::select('SELECT 1');
            return 'Connected';
        } catch (\Exception $e) {
            return 'Error';
        }
    }

    private function checkCache(): string
    {
        try {
            Cache::store(config('cache.default'))->put('health_check', true, 1);
            return Cache::store(config('cache.default'))->get('health_check') ? 'Working' : 'Failed';
        } catch (\Exception $e) {
            return 'Error';
        }
    }

    private function getStorageUsed(): string
    {
        return $this->formatBytes($this->getStorageUsedBytes());
    }

    private function getStorageUsedBytes(): int
    {
        $disk = Storage::disk('local');
        $used = 0;
        foreach ($disk->allFiles() as $file) {
            $used += $disk->size($file);
        }
        return $used;
    }

    private function getStorageFree(): string
    {
        return $this->formatBytes(disk_free_space(storage_path()));
    }

    private function getStorageTotal(): string
    {
        return $this->formatBytes(disk_total_space(storage_path()));
    }

    private function getStoragePercent(): float
    {
        $path = storage_path();
        $total = disk_total_space($path);
        $free = disk_free_space($path);
        if ($total > 0) {
            return round((($total - $free) / $total) * 100, 1);
        }
        return 0;
    }

    private function getFailedJobsCount(): int
    {
        try {
            return DB::table('failed_jobs')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public static function getNavigationLabel(): string
    {
        return 'System Health';
    }

    public function getTitle(): string
    {
        return 'System Health';
    }
}
