<?php

namespace App\Filament\Widgets;

use App\Models\Commission;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdminStatsOverviewWidget extends StatsOverviewWidget
{
    protected static ?int $sort = -1;

    private function getUserRegistrationTrend(): array
    {
        return \App\Models\User::query()
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->values()
            ->toArray();
    }

    private function getWalletTrend(string $column): array
    {
        return \App\Models\WalletTransaction::query()
            ->where('type', $column === 'total_deposited' ? 'deposit' : 'withdrawal')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->values()
            ->toArray();
    }

    private function getWithdrawalTrend(): array
    {
        return \App\Models\Withdrawal::query()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->values()
            ->toArray();
    }

    private function getCommissionTrend(): array
    {
        return \App\Models\Commission::query()
            ->where('status', 'credited')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->values()
            ->toArray();
    }

    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('Registered users')
                ->descriptionIcon('heroicon-o-users')
                ->color('primary')
                ->chart($this->getUserRegistrationTrend()),
            Stat::make('Active Users', User::where('is_active', true)->count())
                ->description('Active accounts')
                ->descriptionIcon('heroicon-o-shield-check')
                ->color('success')
                ->chart($this->getUserRegistrationTrend()),
            Stat::make('Inactive Users', User::where('is_active', false)->count())
                ->description('Inactive accounts')
                ->descriptionIcon('heroicon-o-user-minus')
                ->color('warning')
                ->chart(array_map(fn($v) => max(0, $v - 2), $this->getUserRegistrationTrend())),
            Stat::make('Total Deposits', '$' . number_format(Wallet::sum('total_deposited'), 2))
                ->description('All time deposits')
                ->descriptionIcon('heroicon-o-arrow-trending-up')
                ->color('success')
                ->chart($this->getWalletTrend('total_deposited')),
            Stat::make('Total Withdrawals', '$' . number_format(Wallet::sum('total_withdrawn'), 2))
                ->description('All time withdrawals')
                ->descriptionIcon('heroicon-o-arrow-trending-down')
                ->color('danger')
                ->chart($this->getWalletTrend('total_withdrawn')),
            Stat::make('Total Profit', '$' . number_format(max(0, Wallet::sum('total_deposited') - Wallet::sum('total_withdrawn')), 2))
                ->description('Net revenue')
                ->descriptionIcon('heroicon-o-banknotes')
                ->color('primary')
                ->chart($this->getWalletTrend('total_deposited')),
            Stat::make('Pending Withdrawals', Withdrawal::where('status', 'pending')->count())
                ->description('Awaiting approval')
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning')
                ->chart($this->getWithdrawalTrend()),
            Stat::make('Commissions Paid', '$' . number_format(Commission::where('status', 'credited')->sum('amount'), 2))
                ->description('Total commissions distributed')
                ->descriptionIcon('heroicon-o-currency-dollar')
                ->color('success')
                ->chart($this->getCommissionTrend()),
            Stat::make('Pending Deposits', WalletTransaction::where('type', 'deposit')->where('status', 'pending')->count())
                ->description('Unconfirmed deposits')
                ->descriptionIcon('heroicon-o-clock')
                ->color('info')
                ->chart($this->getWalletTrend('total_deposited')),
        ];
    }
}
