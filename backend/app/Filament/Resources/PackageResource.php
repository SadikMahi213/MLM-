<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\PackageResource\Pages;
use App\Models\Package;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PackageResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Package::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-gift';
    protected static string|\UnitEnum|null $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Package Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required()->maxLength(255),
                        Forms\Components\Select::make('type')
                            ->options(['free' => 'Free', 'paid' => 'Paid'])
                            ->default('paid')->required(),
                        Forms\Components\TextInput::make('price')->numeric()->required()->prefix('$'),
                        Forms\Components\TextInput::make('daily_income')->numeric()->required()->prefix('$'),
                        Forms\Components\TextInput::make('duration_days')->numeric()->required()->default(365),
                        Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                        Forms\Components\Toggle::make('is_active')->default(true),
                    ])->columns(2),
                Section::make('Commission Settings')
                    ->schema([
                        Forms\Components\TextInput::make('binary_bonus_percent')
                            ->numeric()->required()->suffix('%')->step(0.01),
                        Forms\Components\TextInput::make('referral_bonus_percent')
                            ->numeric()->required()->suffix('%')->step(0.01),
                        Forms\Components\TextInput::make('generation_bonus_percent')
                            ->numeric()->required()->suffix('%')->step(0.01),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')->badge()
                    ->color(fn (string $state): string => $state === 'free' ? 'success' : 'primary'),
                Tables\Columns\TextColumn::make('price')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('daily_income')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('binary_bonus_percent')->suffix('%')->sortable(),
                Tables\Columns\TextColumn::make('referral_bonus_percent')->suffix('%')->sortable(),
                Tables\Columns\TextColumn::make('duration_days')->suffix(' days')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('is_active')
                    ->options([true => 'Active', false => 'Inactive']),
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
                        $query = Package::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Sort Order', 'Name', 'Type', 'Price', 'Daily Income', 'Binary Bonus %', 'Referral Bonus %', 'Generation Bonus %', 'Duration Days', 'Is Active', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->sort_order, $r->name, $r->type, $r->price, $r->daily_income, $r->binary_bonus_percent, $r->referral_bonus_percent, $r->generation_bonus_percent, $r->duration_days, $r->is_active ? 'Yes' : 'No', $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'packages-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPackages::route('/'),
            'create' => Pages\CreatePackage::route('/create'),
            'edit' => Pages\EditPackage::route('/{record}/edit'),
        ];
    }
}
