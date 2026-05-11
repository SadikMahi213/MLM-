<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Order::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-shopping-cart';
    protected static string|\UnitEnum|null $navigationGroup = 'Shop';
    protected static int|null $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Order Info')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')->disabled(),
                        Forms\Components\Select::make('user_id')->relationship('user', 'name')->required()->searchable(),
                        Forms\Components\Select::make('status')
                            ->options(['pending' => 'Pending', 'processing' => 'Processing', 'completed' => 'Completed', 'cancelled' => 'Cancelled', 'refunded' => 'Refunded'])
                            ->required(),
                        Forms\Components\Select::make('payment_status')
                            ->options(['pending' => 'Pending', 'paid' => 'Paid', 'failed' => 'Failed', 'refunded' => 'Refunded']),
                        Forms\Components\Select::make('payment_method')->options([
                            'bank' => 'Bank', 'bkash' => 'bKash', 'nagad' => 'Nagad',
                            'usdt' => 'USDT', 'btc' => 'BTC', 'eth' => 'ETH',
                        ]),
                    ])->columns(2),
                Section::make('Financials')
                    ->schema([
                        Forms\Components\TextInput::make('subtotal')->numeric()->prefix('$'),
                        Forms\Components\TextInput::make('shipping_cost')->numeric()->prefix('$'),
                        Forms\Components\TextInput::make('tax')->numeric()->prefix('$'),
                        Forms\Components\TextInput::make('total')->numeric()->prefix('$'),
                    ])->columns(2),
                Section::make('Additional')
                    ->schema([
                        Forms\Components\Textarea::make('shipping_address'),
                        Forms\Components\Textarea::make('notes'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('total')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning', 'processing' => 'info',
                        'completed' => 'success', 'cancelled' => 'danger', 'refunded' => 'gray',
                    }),
                Tables\Columns\TextColumn::make('payment_status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning', 'paid' => 'success',
                        'failed' => 'danger', 'refunded' => 'gray',
                    }),
                Tables\Columns\TextColumn::make('items_count')->counts('items')->label('Items'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['pending' => 'Pending', 'processing' => 'Processing', 'completed' => 'Completed']),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options(['pending' => 'Pending', 'paid' => 'Paid']),
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
                Action::make('complete')
                    ->action(fn (Order $record) => $record->update(['status' => 'completed']))
                    ->visible(fn (Order $record): bool => $record->status === 'processing')
                    ->color('success')->icon('heroicon-o-check'),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = Order::query();
                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['Order Number', 'User', 'Total', 'Status', 'Payment Status', 'Payment Method', 'Items Count', 'Created At']);
                            $query->chunk(500, function ($records) use ($handle) {
                                foreach ($records as $r) {
                                    fputcsv($handle, [$r->order_number, $r->user?->name, $r->total, $r->status, $r->payment_status, $r->payment_method, $r->items_count, $r->created_at]);
                                }
                            });
                            fclose($handle);
                        }, 'orders-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
