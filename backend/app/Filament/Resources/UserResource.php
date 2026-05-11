<?php
namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Notifications\AdminNotification;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = User::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-users';
    protected static string|\UnitEnum|null $navigationGroup = 'User Management';
    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')->required()->maxLength(255),
                        Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('phone')->required()->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('username')->required()->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('password')->password()->hiddenOn('edit')->required(fn (string $context): bool => $context === 'create'),
                        Forms\Components\Select::make('sponsor_id')
                            ->label('Sponsor')
                            ->relationship('sponsor', 'username')
                            ->searchable(),
                        Forms\Components\Select::make('package_id')
                            ->label('Package')
                            ->relationship('package', 'name')
                            ->searchable(),
                    ])->columns(2),
                Section::make('Status')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')->default(true),
                        Forms\Components\Toggle::make('is_verified')->default(false),
                        Forms\Components\Toggle::make('two_factor_enabled')->default(false),
                    ])->columns(3),
                Section::make('Personal Information')
                    ->schema([
                        Forms\Components\TextInput::make('avatar')->maxLength(255),
                        Forms\Components\TextInput::make('country')->maxLength(100),
                        Forms\Components\TextInput::make('city')->maxLength(100),
                        Forms\Components\Textarea::make('address')->maxLength(500),
                        Forms\Components\DatePicker::make('date_of_birth'),
                        Forms\Components\Select::make('gender')->options([
                            'male' => 'Male',
                            'female' => 'Female',
                            'other' => 'Other',
                        ]),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('phone')->searchable(),
                Tables\Columns\TextColumn::make('username')->searchable(),
                Tables\Columns\TextColumn::make('sponsor.username')->label('Sponsor'),
                Tables\Columns\TextColumn::make('package.name')->label('Package'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\IconColumn::make('is_verified')->boolean(),
                Tables\Columns\IconColumn::make('two_factor_enabled')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('is_active')
                    ->options([true => 'Active', false => 'Inactive']),
                Tables\Filters\SelectFilter::make('is_verified')
                    ->options([true => 'Verified', false => 'Unverified']),
                Tables\Filters\SelectFilter::make('package_id')
                    ->relationship('package', 'name'),

            ])
            ->actions([
                ViewAction::make(),
                EditAction::make(),
                Action::make('activate')
                    ->action(fn (User $user) => $user->update(['is_active' => true]))
                    ->visible(fn (User $user): bool => !$user->is_active)
                    ->color('success')
                    ->icon('heroicon-o-check'),
                Action::make('deactivate')
                    ->action(fn (User $user) => $user->update(['is_active' => false]))
                    ->visible(fn (User $user): bool => $user->is_active)
                    ->color('danger')
                    ->icon('heroicon-o-x-mark'),
                Action::make('verify')
                    ->action(fn (User $user) => $user->update(['is_verified' => true]))
                    ->visible(fn (User $user): bool => !$user->is_verified)
                    ->color('success')
                    ->icon('heroicon-o-shield-check'),
                Action::make('impersonate')
                    ->label('Impersonate')
                    ->icon('heroicon-o-key')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (User $user) {
                        $token = $user->createToken('impersonation', ['*'], now()->addMinutes(5))->plainTextToken;
                        $url = config('app.frontend_url', 'http://localhost:3000') . '/api/auth/login?token=' . $token . '&email=' . $user->email;
                        Notification::make()
                            ->title('Impersonation Token Generated')
                            ->body("Token: {$token}\nExpires: 5 minutes\n\nLogin URL: {$url}")
                            ->success()
                            ->persistent()
                            ->send();
                    }),
                Action::make('send_notification')
                    ->label('Send Notification')
                    ->icon('heroicon-o-bell')
                    ->color('info')
                    ->form([
                        Textarea::make('message')
                            ->required()
                            ->maxLength(1000),
                        Forms\Components\TextInput::make('url')
                            ->label('URL (optional)')
                            ->maxLength(500),
                    ])
                    ->action(function (array $data, User $user) {
                        $user->notify(new AdminNotification($data['message'], $data['url'] ?? null));
                        Notification::make()
                            ->title('Notification sent')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    BulkAction::make('bulk_activate')
                        ->label('Activate Selected')
                        ->icon('heroicon-o-check')
                        ->color('success')
                        ->action(fn (\Illuminate\Support\Collection $records) => $records->each->update(['is_active' => true])),
                    BulkAction::make('bulk_deactivate')
                        ->label('Deactivate Selected')
                        ->icon('heroicon-o-x-mark')
                        ->color('danger')
                        ->action(fn (\Illuminate\Support\Collection $records) => $records->each->update(['is_active' => false])),
                    BulkAction::make('bulk_verify')
                        ->label('Verify Selected')
                        ->icon('heroicon-o-shield-check')
                        ->color('success')
                        ->action(fn (\Illuminate\Support\Collection $records) => $records->each->update(['is_verified' => true])),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
