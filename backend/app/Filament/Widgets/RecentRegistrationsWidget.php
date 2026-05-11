<?php
namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentRegistrationsWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(User::where('created_at', '>=', now()->subDays(7)))
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('username')->searchable(),
                Tables\Columns\TextColumn::make('sponsor.username')->label('Sponsor'),
                Tables\Columns\TextColumn::make('package.name')->label('Package'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('last_login_at')->dateTime()->label('Last Login'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->label('Joined'),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([5, 10]);
    }
}
