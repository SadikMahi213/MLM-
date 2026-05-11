<?php
namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\User;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
            Actions\Action::make('export_csv')
                ->label('Export CSV')
                ->icon('heroicon-o-document-arrow-down')
                ->color('gray')
                ->action(function () {
                    $users = User::with('sponsor', 'package', 'wallet')->orderBy('id')->get();

                    $headers = [
                        'Content-Type' => 'text/csv',
                        'Content-Disposition' => 'attachment; filename="users-' . now()->format('Y-m-d-His') . '.csv"',
                    ];

                    $callback = function () use ($users) {
                        $handle = fopen('php://output', 'w');
                        fputcsv($handle, ['ID', 'Name', 'Email', 'Username', 'Phone', 'Sponsor', 'Package', 'Active', 'Verified', '2FA', 'Wallet Balance', 'Country', 'City', 'Joined At']);

                        foreach ($users as $user) {
                            fputcsv($handle, [
                                $user->id,
                                $user->name,
                                $user->email,
                                $user->username,
                                $user->phone,
                                $user->sponsor?->username,
                                $user->package?->name,
                                $user->is_active ? 'Yes' : 'No',
                                $user->is_verified ? 'Yes' : 'No',
                                $user->two_factor_enabled ? 'Yes' : 'No',
                                $user->wallet?->balance ?? 0,
                                $user->country,
                                $user->city,
                                $user->created_at?->toDateTimeString(),
                            ]);
                        }

                        fclose($handle);
                    };

                    return response()->stream($callback, 200, $headers);
                }),
        ];
    }
}
