<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\WithdrawalResource\Pages;
use App\Models\Withdrawal;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WithdrawalResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Withdrawal::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-banknotes';
    protected static string|\UnitEnum|null $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable(),
                Forms\Components\TextInput::make('amount')->numeric()->required(),
                Forms\Components\TextInput::make('fee')->numeric()->required(),
                Forms\Components\TextInput::make('net_amount')->numeric()->required(),
                Forms\Components\Select::make('payment_method')
                    ->options(['bkash' => 'bKash', 'nagad' => 'Nagad', 'bank' => 'Bank'])
                    ->required(),
                Forms\Components\TextInput::make('account_number')->required(),
                Forms\Components\TextInput::make('account_holder'),
                Forms\Components\Select::make('status')
                    ->options(['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected', 'completed' => 'Completed'])
                    ->required(),
                Forms\Components\Textarea::make('admin_note'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('amount')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('fee')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('net_amount')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('payment_method')->badge(),
                Tables\Columns\TextColumn::make('account_number'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        'completed' => 'info',
                    }),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected', 'completed' => 'Completed']),
                Tables\Filters\SelectFilter::make('payment_method')
                    ->options(['bkash' => 'bKash', 'nagad' => 'Nagad', 'bank' => 'Bank']),
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
                Action::make('approve')
                    ->action(fn (Withdrawal $record) => $record->update(['status' => 'approved', 'approved_at' => now()]))
                    ->visible(fn (Withdrawal $record): bool => $record->status === 'pending')
                    ->color('success')
                    ->icon('heroicon-o-check')
                    ->requiresConfirmation(),
                Action::make('complete')
                    ->action(fn (Withdrawal $record) => $record->update(['status' => 'completed', 'completed_at' => now()]))
                    ->visible(fn (Withdrawal $record): bool => $record->status === 'approved')
                    ->color('info')
                    ->icon('heroicon-o-check-circle')
                    ->requiresConfirmation(),
                Action::make('reject')
                    ->form([
                        Forms\Components\Textarea::make('reason')->required(),
                    ])
                    ->action(function (Withdrawal $record, array $data): void {
                        $wallet = $record->user->wallet;
                        if ($wallet) {
                            $wallet->balance += $record->amount;
                            $wallet->withdrawable_balance += $record->amount;
                            $wallet->save();
                        }
                        $record->update(['status' => 'rejected', 'admin_note' => $data['reason']]);
                    })
                    ->visible(fn (Withdrawal $record): bool => in_array($record->status, ['pending', 'approved']))
                    ->color('danger')
                    ->icon('heroicon-o-x-mark')
                    ->requiresConfirmation(),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = Withdrawal::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['ID', 'User', 'Amount', 'Fee', 'Net Amount', 'Payment Method', 'Account Number', 'Account Holder', 'Status', 'Admin Note', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->id, $r->user?->name, $r->amount, $r->fee, $r->net_amount, $r->payment_method, $r->account_number, $r->account_holder, $r->status, $r->admin_note, $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'withdrawals-export-' . now()->format('Y-m-d') . '.csv');
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
            'index' => Pages\ListWithdrawals::route('/'),
            'create' => Pages\CreateWithdrawal::route('/create'),
            'edit' => Pages\EditWithdrawal::route('/{record}/edit'),
        ];
    }
}
