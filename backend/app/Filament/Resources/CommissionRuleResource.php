<?php

namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Models\CommissionRule;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Forms\Components\DatePicker;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CommissionRuleResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = CommissionRule::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-percent-badge';
    protected static string|\UnitEnum|null $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Section::make('Rule Details')->schema([
                    Forms\Components\TextInput::make('name')
                        ->required()
                        ->maxLength(255)
                        ->prefixIcon('heroicon-o-tag')
                        ->placeholder('e.g. Level 1 Referral Bonus'),
                    Forms\Components\Select::make('type')
                        ->required()
                        ->options([
                            'referral' => 'Referral Bonus',
                            'binary' => 'Binary Bonus',
                            'generation' => 'Generation Bonus',
                            'daily_income' => 'Daily Income',
                        ])
                        ->native(false)
                        ->searchable()
                        ->prefixIcon('heroicon-o-cog-6-tooth'),
                    Forms\Components\TextInput::make('level')
                        ->numeric()
                        ->required()
                        ->default(1)
                        ->minValue(1)
                        ->helperText('Depth level for this commission rule'),
                    Forms\Components\TextInput::make('percentage')
                        ->numeric()
                        ->required()
                        ->suffix('%')
                        ->step(0.01)
                        ->minValue(0)
                        ->maxValue(100)
                        ->prefixIcon('heroicon-o-chart-pie'),
                    Forms\Components\Textarea::make('description')
                        ->maxLength(500)
                        ->placeholder('Optional description of this rule')
                        ->columnSpanFull(),
                    Forms\Components\Toggle::make('is_active')
                        ->default(true)
                        ->inline(false),
                ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->sortable()
                    ->toggleable()
                    ->color(fn (string $state): string => match ($state) {
                        'referral' => 'success',
                        'binary' => 'info',
                        'generation' => 'warning',
                        'daily_income' => 'primary',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('level')
                    ->sortable()
                    ->toggleable()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('percentage')
                    ->suffix('%')
                    ->sortable()
                    ->toggleable()
                    ->color(fn ($record): string => $record->percentage > 20 ? 'danger' : ($record->percentage > 10 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('description')
                    ->limit(40)
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->tooltip(fn ($record): ?string => $record->description),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(['referral' => 'Referral Bonus', 'binary' => 'Binary Bonus', 'generation' => 'Generation Bonus', 'daily_income' => 'Daily Income'])
                    ->native(false)
                    ->searchable(),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->placeholder('All')
                    ->trueLabel('Active')
                    ->falseLabel('Inactive'),
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
                ViewAction::make()
                    ->modalHeading(fn ($record) => "Commission Rule: {$record->name}"),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = CommissionRule::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Name', 'Type', 'Level', 'Percentage', 'Description', 'Is Active', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->name, $r->type, $r->level, $r->percentage, $r->description, $r->is_active ? 'Yes' : 'No', $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'commission-rules-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('type', 'level')
            ->striped()
            ->poll('60s');
    }

    public static function getPages(): array
    {
        return [
            'index' => CommissionRuleResource\Pages\ListCommissionRules::route('/'),
            'create' => CommissionRuleResource\Pages\CreateCommissionRule::route('/create'),
            'edit' => CommissionRuleResource\Pages\EditCommissionRule::route('/{record}/edit'),
        ];
    }
}
