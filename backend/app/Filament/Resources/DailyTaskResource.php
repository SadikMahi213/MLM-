<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\DailyTaskResource\Pages;
use App\Models\DailyTask;
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

class DailyTaskResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = DailyTask::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static string|\UnitEnum|null $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Task Details')
                    ->schema([
                        Forms\Components\TextInput::make('title')->required()->maxLength(255),
                        Forms\Components\Textarea::make('description'),
                        Forms\Components\TextInput::make('reward')->numeric()->required()->prefix('$'),
                        Forms\Components\Select::make('type')
                            ->options(['daily' => 'Daily', 'weekly' => 'Weekly', 'monthly' => 'Monthly'])
                            ->default('daily'),
                        Forms\Components\Toggle::make('is_active')->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('reward')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('completions_count')->counts('completions')->label('Completions'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(['daily' => 'Daily', 'weekly' => 'Weekly', 'monthly' => 'Monthly']),
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
                        $query = DailyTask::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Title', 'Reward', 'Type', 'Is Active', 'Completions Count', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->title, $r->reward, $r->type, $r->is_active ? 'Yes' : 'No', $r->completions_count, $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'daily-tasks-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDailyTasks::route('/'),
            'create' => Pages\CreateDailyTask::route('/create'),
            'edit' => Pages\EditDailyTask::route('/{record}/edit'),
        ];
    }
}
