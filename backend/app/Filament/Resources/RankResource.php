<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\RankResource\Pages;
use App\Models\Rank;
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

class RankResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Rank::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-trophy';
    protected static string|\UnitEnum|null $navigationGroup = 'Settings';
    protected static int|null $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Rank Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required()->maxLength(100),
                        Forms\Components\TextInput::make('level')->numeric()->required()->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('icon')->maxLength(255)->helperText('star, medal, crown, gem, trophy'),
                        Forms\Components\Textarea::make('description'),
                        Forms\Components\Textarea::make('benefits'),
                        Forms\Components\Toggle::make('is_active')->default(true),
                    ])->columns(2),
                Section::make('Requirements')
                    ->schema([
                        Forms\Components\TextInput::make('min_direct_referrals')->numeric()->default(0),
                        Forms\Components\TextInput::make('min_team_members')->numeric()->default(0),
                        Forms\Components\TextInput::make('min_active_team')->numeric()->default(0),
                        Forms\Components\TextInput::make('min_team_bv')->numeric()->default(0),
                    ])->columns(2),
                Section::make('Bonus')
                    ->schema([
                        Forms\Components\TextInput::make('bonus_percent')->numeric()->suffix('%')->step(0.01),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('level')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('min_direct_referrals')->sortable(),
                Tables\Columns\TextColumn::make('min_team_members')->sortable(),
                Tables\Columns\TextColumn::make('min_team_bv')->sortable(),
                Tables\Columns\TextColumn::make('bonus_percent')->suffix('%')->sortable(),
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
                        $query = Rank::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Level', 'Name', 'Min Direct Referrals', 'Min Team Members', 'Min Team BV', 'Bonus %', 'Is Active', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->level, $r->name, $r->min_direct_referrals, $r->min_team_members, $r->min_team_bv, $r->bonus_percent, $r->is_active ? 'Yes' : 'No', $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'ranks-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('level');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRanks::route('/'),
            'create' => Pages\CreateRank::route('/create'),
            'edit' => Pages\EditRank::route('/{record}/edit'),
        ];
    }
}
