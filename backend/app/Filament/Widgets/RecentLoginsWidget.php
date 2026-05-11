<?php
namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentLoginsWidget extends BaseWidget
{
    protected static ?int $sort = 4;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(User::whereNotNull('last_login_at')->orderBy('last_login_at', 'desc')->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('last_login_at')->dateTime()->sortable()->label('Last Login'),
                Tables\Columns\TextColumn::make('last_login_ip')->label('IP Address')->copyable(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->paginated(false);
    }
}
