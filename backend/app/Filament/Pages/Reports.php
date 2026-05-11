<?php

namespace App\Filament\Pages;

use App\Models\Commission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Filament\Pages\Page;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Reports extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar-square';
    protected static string|\UnitEnum|null $navigationGroup = 'Reports';
    protected static ?int $navigationSort = 1;
    protected string $view = 'filament.pages.reports';
    protected static ?string $slug = 'reports';

    public string $period = 'daily';
    public array $stats = [];
    public array $chartData = [];
    public bool $loading = true;

    public function mount(): void
    {
        $this->loadStats();
    }

    public function loadStats(): void
    {
        $this->loading = true;

        $now = Carbon::now();

        $start = match ($this->period) {
            'daily' => $now->copy()->subDays(30),
            'weekly' => $now->copy()->subWeeks(12),
            'monthly' => $now->copy()->subMonths(12),
            default => $now->copy()->subDays(30),
        };

        $dateFormat = match ($this->period) {
            'daily' => "strftime('%Y-%m-%d', created_at)",
            'weekly' => "strftime('%Y-%W', created_at)",
            'monthly' => "strftime('%Y-%m', created_at)",
            default => "strftime('%Y-%m-%d', created_at)",
        };

        $groupField = DB::raw("$dateFormat as date_group");

        $registrations = User::where('created_at', '>=', $start)
            ->select($groupField, DB::raw('COUNT(*) as total'))
            ->groupBy('date_group')
            ->orderBy('date_group')
            ->pluck('total', 'date_group');

        $deposits = WalletTransaction::where('type', 'deposit')
            ->where('created_at', '>=', $start)
            ->select($groupField, DB::raw('SUM(amount) as total'))
            ->groupBy('date_group')
            ->orderBy('date_group')
            ->pluck('total', 'date_group');

        $withdrawals = Withdrawal::where('created_at', '>=', $start)
            ->where('status', 'completed')
            ->select($groupField, DB::raw('SUM(amount) as total'))
            ->groupBy('date_group')
            ->orderBy('date_group')
            ->pluck('total', 'date_group');

        $commissions = Commission::where('created_at', '>=', $start)
            ->where('status', 'credited')
            ->select($groupField, DB::raw('SUM(amount) as total'))
            ->groupBy('date_group')
            ->orderBy('date_group')
            ->pluck('total', 'date_group');

        $this->chartData = [
            'labels' => $registrations->keys()->toArray(),
            'registrations' => $registrations->values()->toArray(),
            'deposits' => $deposits->values()->toArray(),
            'withdrawals' => $withdrawals->values()->toArray(),
            'commissions' => $commissions->values()->toArray(),
        ];

        $this->stats = [
            'total_users' => User::count(),
            'total_deposits' => WalletTransaction::where('type', 'deposit')->sum('amount'),
            'total_withdrawals' => Withdrawal::where('status', 'completed')->sum('amount'),
            'total_commissions' => Commission::where('status', 'credited')->sum('amount'),
            'pending_withdrawals' => Withdrawal::where('status', 'pending')->sum('amount'),
            'new_users_30d' => User::where('created_at', '>=', $now->copy()->subDays(30))->count(),
            'deposits_30d' => WalletTransaction::where('type', 'deposit')->where('created_at', '>=', $now->copy()->subDays(30))->sum('amount'),
            'withdrawals_30d' => Withdrawal::where('status', 'completed')->where('created_at', '>=', $now->copy()->subDays(30))->sum('amount'),
            'commissions_30d' => Commission::where('status', 'credited')->where('created_at', '>=', $now->copy()->subDays(30))->sum('amount'),
            'profit_30d' => Commission::where('status', 'credited')->where('created_at', '>=', $now->copy()->subDays(30))->sum('amount') - Withdrawal::where('status', 'completed')->where('created_at', '>=', $now->copy()->subDays(30))->sum('amount'),
        ];

        $this->loading = false;
    }

    public function setPeriod(string $period): void
    {
        $this->period = $period;
        $this->loadStats();
    }

    public function exportCsv(): StreamedResponse
    {
        $this->loadStats();
        $headers = ['Metric', 'Value'];
        $rows = [
            ['Total Users', $this->stats['total_users']],
            ['Total Deposits', number_format($this->stats['total_deposits'], 2)],
            ['Total Withdrawals', number_format($this->stats['total_withdrawals'], 2)],
            ['Total Commissions', number_format($this->stats['total_commissions'], 2)],
            ['Pending Withdrawals', number_format($this->stats['pending_withdrawals'], 2)],
            ['New Users (30 days)', $this->stats['new_users_30d']],
            ['Deposits (30 days)', number_format($this->stats['deposits_30d'], 2)],
            ['Withdrawals (30 days)', number_format($this->stats['withdrawals_30d'], 2)],
            ['Commissions (30 days)', number_format($this->stats['commissions_30d'], 2)],
            ['Profit (30 days)', number_format($this->stats['profit_30d'], 2)],
        ];

        return response()->streamDownload(function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, "report_{$this->period}_" . now()->format('Y-m-d') . '.csv');
    }

    public static function getNavigationLabel(): string
    {
        return 'Reports';
    }

    public function getTitle(): string
    {
        return 'Analytics & Reports';
    }
}
