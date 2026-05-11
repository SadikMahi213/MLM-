<?php
namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use App\Services\SettingsService;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSettings extends ListRecords
{
    protected static string $resource = SettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
            Actions\Action::make('flush_cache')
                ->label('Flush Settings Cache')
                ->icon('heroicon-o-arrow-path')
                ->color('gray')
                ->action(fn (SettingsService $settings) => $settings->flush())
                ->after(fn () => $this->dispatch('$refresh'))
                ->requiresConfirmation()
                ->successNotificationTitle('Settings cache flushed successfully!'),
        ];
    }
}
