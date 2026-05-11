<?php

namespace App\Filament\Resources;

use App\Filament\Traits\HasAdminPermissions;
use App\Models\AuditLog;
use Filament\Actions\Action;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Filament\Forms\Components\DatePicker;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogResource extends Resource
{
    use HasAdminPermissions;

    protected static ?string $model = AuditLog::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document-text';
    protected static string|\UnitEnum|null $navigationGroup = 'System';
    protected static ?int $navigationSort = 1;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('user.name')->searchable()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('action')->badge()->searchable()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('module')->badge()->searchable()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('auditable_type')
                    ->label('Auditable Type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('auditable_id')
                    ->label('Auditable ID')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('ip_address')->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime('M d, Y H:i')->sortable()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('action')
                    ->options(fn (): array => AuditLog::distinct()->pluck('action', 'action')->toArray()),
                SelectFilter::make('module')
                    ->options(fn (): array => AuditLog::distinct()->pluck('module', 'module')->toArray()),
                SelectFilter::make('user_id')
                    ->label('User')
                    ->relationship('user', 'name')
                    ->searchable(),
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
                    ->form([
                        \Filament\Forms\Components\TextInput::make('action'),
                        \Filament\Forms\Components\TextInput::make('module'),
                        \Filament\Forms\Components\KeyValue::make('old_values'),
                        \Filament\Forms\Components\KeyValue::make('new_values'),
                        \Filament\Forms\Components\TextInput::make('ip_address'),
                        \Filament\Forms\Components\Textarea::make('user_agent')->columnSpanFull(),
                    ]),
            ])
            ->headerActions([
                Action::make('exportCsv')
                    ->label('Export CSV')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $query = AuditLog::with('user')->latest();
                        
                        if ($userFilter = request()->get('tableFilters.user_id.value')) {
                            $query->where('user_id', $userFilter);
                        }
                        if ($actionFilter = request()->get('tableFilters.action.value')) {
                            $query->where('action', $actionFilter);
                        }
                        if ($moduleFilter = request()->get('tableFilters.module.value')) {
                            $query->where('module', $moduleFilter);
                        }

                        return response()->streamDownload(function () use ($query) {
                            $handle = fopen('php://output', 'w');
                            fputcsv($handle, ['ID', 'User', 'Action', 'Module', 'Auditable Type', 'Auditable ID', 'IP Address', 'Created At']);
                            
                            $query->chunk(500, function ($logs) use ($handle) {
                                foreach ($logs as $log) {
                                    fputcsv($handle, [
                                        $log->id,
                                        $log->user?->name ?? 'System',
                                        $log->action,
                                        $log->module,
                                        class_basename($log->auditable_type),
                                        $log->auditable_id,
                                        $log->ip_address,
                                        $log->created_at->format('Y-m-d H:i:s'),
                                    ]);
                                }
                            });
                            
                            fclose($handle);
                        }, 'audit-log-export-' . now()->format('Y-m-d') . '.csv');
                    }),
            ])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => AuditLogResource\Pages\ListAuditLogs::route('/'),
        ];
    }
}
