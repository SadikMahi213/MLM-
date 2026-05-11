<?php

namespace App\Filament\Widgets;

use App\Models\WalletTransaction;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;

class RevenueChartWidget extends ChartWidget
{
    protected ?string $heading = 'Revenue Overview';
    protected static ?int $sort = 1;
    protected int | string | array $columnSpan = 2;
    protected string $color = 'primary';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $days = 14;
        $data = collect(range($days - 1, 0))->map(function ($day) {
            $date = now()->subDays($day)->format('Y-m-d');
            $deposits = WalletTransaction::whereDate('created_at', $date)
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount');
            $withdrawals = WalletTransaction::whereDate('created_at', $date)
                ->where('type', 'withdrawal')
                ->where('status', 'completed')
                ->sum('amount');
            return [
                'date' => now()->subDays($day)->format('M d'),
                'deposits' => (float) $deposits,
                'withdrawals' => (float) $withdrawals,
            ];
        });

        return [
            'datasets' => [
                [
                    'label' => 'Deposits',
                    'data' => $data->pluck('deposits')->toArray(),
                    'backgroundColor' => 'rgba(59, 130, 246, 0.6)',
                    'borderColor' => 'rgba(59, 130, 246, 1)',
                    'borderWidth' => 1,
                    'borderRadius' => 4,
                ],
                [
                    'label' => 'Withdrawals',
                    'data' => $data->pluck('withdrawals')->toArray(),
                    'backgroundColor' => 'rgba(239, 68, 68, 0.6)',
                    'borderColor' => 'rgba(239, 68, 68, 1)',
                    'borderWidth' => 1,
                    'borderRadius' => 4,
                ],
            ],
            'labels' => $data->pluck('date')->toArray(),
        ];
    }

    protected function getOptions(): array | RawJs | null
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels' => [
                        'padding' => 20,
                        'usePointStyle' => true,
                        'boxWidth' => 8,
                    ],
                ],
            ],
            'scales' => [
                'x' => [
                    'grid' => ['display' => false],
                    'ticks' => ['font' => ['size' => 10]],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'grid' => ['color' => 'rgba(255, 255, 255, 0.05)'],
                    'ticks' => [
                        'font' => ['size' => 10],
                        'callback' => RawJs::make('function(value) { return "$" + value.toLocaleString(); }'),
                    ],
                ],
            ],
        ];
    }
}
