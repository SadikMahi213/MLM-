<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\SettingResource\Pages;
use App\Models\Setting;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Actions\Action;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class SettingResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Setting::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('key')
                    ->required()->maxLength(255)->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('value')
                    ->rows(3),
                Forms\Components\Select::make('group')
                    ->options([
                        'general' => 'General',
                        'branding' => 'Branding',
                        'landing' => 'Landing Page',
                        'theme' => 'Theme',
                        'features' => 'Features',
                        'dashboard' => 'Dashboard',
                        'announcements' => 'Announcements',
                        'social' => 'Social Links',
                        'cms' => 'CMS',
                        'seo' => 'SEO',
                    ])
                    ->required(),
                Forms\Components\Select::make('type')
                    ->options([
                        'string' => 'String',
                        'number' => 'Number',
                        'boolean' => 'Boolean',
                        'json' => 'JSON',
                    ])
                    ->default('string')
                    ->required(),
                Forms\Components\Toggle::make('is_public')
                    ->label('Expose via API')
                    ->default(false),
                Forms\Components\Textarea::make('description')
                    ->rows(2)
                    ->maxLength(500),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('value')->limit(50),
                Tables\Columns\TextColumn::make('group')->badge()->sortable(),
                Tables\Columns\TextColumn::make('type')->badge()->sortable(),
                Tables\Columns\IconColumn::make('is_public')->boolean()->sortable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('group')
                    ->options(fn () => Setting::distinct()->pluck('group', 'group')->toArray()),
                Tables\Filters\SelectFilter::make('is_public')
                    ->options([true => 'Public', false => 'Private']),
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('from')->label('From'),
                        DatePicker::make('to')->label('To'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'], fn (Builder $q, $date): Builder => $q->whereDate('created_at', '>=', $date))
                            ->when($data['to'], fn (Builder $q, $date): Builder => $q->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = Setting::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Key', 'Value', 'Group', 'Type', 'Is Public', 'Updated At', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->key, $r->value, $r->group, $r->type, $r->is_public ? 'Yes' : 'No', $r->updated_at, $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'settings-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('group', 'key');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSettings::route('/'),
            'create' => Pages\CreateSetting::route('/create'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }
}
