<?php
namespace App\Filament\Resources\DailyTaskResource\Pages;

use App\Filament\Resources\DailyTaskResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDailyTask extends EditRecord
{
    protected static string $resource = DailyTaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
