<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\WalletTransactionResource\Pages;
use App\Models\WalletTransaction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Actions\Action;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WalletTransactionResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = WalletTransaction::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-arrows-right-left';
    protected static string|\UnitEnum|null $navigationGroup = 'Finance';
    protected static ?string $navigationLabel = 'Transactions';
    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')->badge()->searchable(),
                Tables\Columns\TextColumn::make('amount')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('fee')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('balance_before')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('balance_after')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'completed' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('description')->limit(40),
                Tables\Columns\TextColumn::make('reference_type')->badge(),
                Tables\Columns\TextColumn::make('transaction_id')->copyable(),
                Tables\Columns\TextColumn::make('completed_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(fn () => WalletTransaction::distinct()->pluck('type', 'type')->toArray()),
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'completed' => 'Completed', 'failed' => 'Failed']),
                Tables\Filters\SelectFilter::make('user_id')
                    ->relationship('user', 'name')->searchable(),
                Tables\Filters\Filter::make('date_range')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['from'], fn (Builder $q, $date): Builder => $q->whereDate('created_at', '>=', $date))
                        ->when($data['until'], fn (Builder $q, $date): Builder => $q->whereDate('created_at', '<=', $date))
                    ),
            ])
            ->actions([])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = WalletTransaction::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['ID', 'User', 'Type', 'Amount', 'Fee', 'Balance Before', 'Balance After', 'Status', 'Description', 'Reference Type', 'Transaction ID', 'Completed At', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->id, $r->user?->name, $r->type, $r->amount, $r->fee, $r->balance_before, $r->balance_after, $r->status, $r->description, $r->reference_type, $r->transaction_id, $r->completed_at, $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'wallet-transactions-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWalletTransactions::route('/'),
        ];
    }
}
