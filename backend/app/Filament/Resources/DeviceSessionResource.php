<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\DeviceSessionResource\Pages;
use App\Models\DeviceSession;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class DeviceSessionResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = DeviceSession::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-device-phone-mobile';
    protected static string|\UnitEnum|null $navigationGroup = 'User Management';
    protected static ?string $navigationLabel = 'Sessions';
    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('user.email')->searchable(),
                Tables\Columns\TextColumn::make('device_name')->searchable()->limit(25),
                Tables\Columns\TextColumn::make('platform')->badge(),
                Tables\Columns\TextColumn::make('browser')->limit(20),
                Tables\Columns\TextColumn::make('ip_address')->copyable(),
                Tables\Columns\IconColumn::make('is_current')->boolean(),
                Tables\Columns\TextColumn::make('location')->limit(30),
                Tables\Columns\TextColumn::make('last_activity')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->label('First Seen'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('platform')
                    ->options(fn () => DeviceSession::distinct()->pluck('platform', 'platform')->toArray()),
                Tables\Filters\SelectFilter::make('is_current')
                    ->options([true => 'Current', false => 'Past']),
                Tables\Filters\SelectFilter::make('user_id')
                    ->relationship('user', 'name')->searchable(),
            ])
            ->actions([])
            ->bulkActions([])
            ->defaultSort('last_activity', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDeviceSessions::route('/'),
        ];
    }
}
