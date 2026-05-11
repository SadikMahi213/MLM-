<?php

namespace App\Filament\Pages;

use App\Models\Package;
use App\Models\User;
use App\Notifications\AdminNotification;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class BulkNotification extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-megaphone';
    protected static string|\UnitEnum|null $navigationGroup = 'User Management';
    protected static ?int $navigationSort = 3;
    protected string $view = 'filament.pages.bulk-notification';
    protected static ?string $slug = 'bulk-notification';

    public array $selectedPackages = [];
    public string $userFilter = 'all';
    public bool $activeOnly = true;
    public ?string $registeredFrom = null;
    public ?string $registeredTo = null;
    public string $message = '';
    public ?string $url = null;
    public int $previewCount = 0;
    public bool $sending = false;
    public bool $sent = false;
    public int $processedCount = 0;
    public int $totalCount = 0;

    public function mount(): void
    {
        $this->updatePreview();
    }

    public function updatePreview(): void
    {
        $query = $this->buildQuery();
        $this->previewCount = $query->count();
    }

    public function updated($property): void
    {
        if ($this->sending) return;
        if (in_array($property, ['selectedPackages', 'userFilter', 'activeOnly', 'registeredFrom', 'registeredTo'])) {
            $this->updatePreview();
        }
    }

    protected function buildQuery()
    {
        $query = User::query();

        match ($this->userFilter) {
            'has_package' => $query->whereNotNull('package_id'),
            'no_package' => $query->whereNull('package_id'),
            'by_package' => !empty($this->selectedPackages) ? $query->whereIn('package_id', $this->selectedPackages) : null,
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => null,
        };

        if ($this->activeOnly && !in_array($this->userFilter, ['active', 'inactive'])) {
            $query->where('is_active', true);
        }

        if ($this->registeredFrom) {
            $query->whereDate('created_at', '>=', $this->registeredFrom);
        }

        if ($this->registeredTo) {
            $query->whereDate('created_at', '<=', $this->registeredTo);
        }

        return $query;
    }

    public function sendNotifications(): void
    {
        $this->validate([
            'message' => 'required|string|max:5000',
            'url' => 'nullable|url|max:500',
        ]);

        $query = $this->buildQuery();
        $this->totalCount = $query->count();

        if ($this->totalCount === 0) {
            Notification::make()->title('No users match the selected criteria')->warning()->send();
            return;
        }

        $this->sending = true;
        $this->sent = false;
        $this->processedCount = 0;

        $query->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->notify(new AdminNotification($this->message, $this->url));
                $this->processedCount++;
            }
            $this->dispatch('progress-updated', processed: $this->processedCount, total: $this->totalCount);
        });

        $this->sending = false;
        $this->sent = true;

        Notification::make()
            ->title("Notification sent to {$this->processedCount} users")
            ->success()
            ->send();

        $this->message = '';
        $this->url = null;
        $this->updatePreview();
    }

    public function getPackages(): array
    {
        return Package::orderBy('name')->pluck('name', 'id')->toArray();
    }

    public static function getNavigationLabel(): string
    {
        return 'Bulk Notification';
    }

    public function getTitle(): string
    {
        return 'Send Bulk Notification';
    }
}
