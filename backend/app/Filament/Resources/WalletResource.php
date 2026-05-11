<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\WalletResource\Pages;
use App\Models\Wallet;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class WalletResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = Wallet::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-wallet';
    protected static string|\UnitEnum|null $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable(),
                Forms\Components\TextInput::make('balance')->numeric()->required(),
                Forms\Components\TextInput::make('income_balance')->numeric()->required(),
                Forms\Components\TextInput::make('bonus_balance')->numeric()->required(),
                Forms\Components\TextInput::make('withdrawable_balance')->numeric()->required(),
                Forms\Components\TextInput::make('total_deposited')->numeric()->required(),
                Forms\Components\TextInput::make('total_withdrawn')->numeric()->required(),
                Forms\Components\TextInput::make('total_income')->numeric()->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('balance')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('income_balance')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('bonus_balance')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('withdrawable_balance')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('total_deposited')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('total_withdrawn')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('total_income')->money('USD')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([])
            ->actions([
                EditAction::make(),
                Action::make('credit')
                    ->form([
                        Forms\Components\TextInput::make('amount')->numeric()->required(),
                        Forms\Components\TextInput::make('description'),
                    ])
                    ->action(function (Wallet $wallet, array $data): void {
                        $wallet->credit($data['amount'], 'admin_credit', $data['description'] ?? 'Manual credit by admin');
                    })
                    ->color('success')
                    ->icon('heroicon-o-plus'),
                Action::make('debit')
                    ->form([
                        Forms\Components\TextInput::make('amount')->numeric()->required(),
                        Forms\Components\TextInput::make('description'),
                    ])
                    ->action(function (Wallet $wallet, array $data): void {
                        $wallet->debit($data['amount'], 'admin_debit', $data['description'] ?? 'Manual debit by admin');
                    })
                    ->color('danger')
                    ->icon('heroicon-o-minus'),
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
            'index' => Pages\ListWallets::route('/'),
            'create' => Pages\CreateWallet::route('/create'),
            'edit' => Pages\EditWallet::route('/{record}/edit'),
        ];
    }
}
