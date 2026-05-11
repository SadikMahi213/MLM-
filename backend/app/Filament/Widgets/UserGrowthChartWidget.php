<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;

class UserGrowthChartWidget extends ChartWidget
{
    protected ?string $heading = 'User Registrations';
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 1;
    protected string $color = 'success';

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $data = \App\Models\User::query()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $labels = [];
        $values = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('M d');
            $values[] = $data[$date] ?? 0;
        }

        return [
            'datasets' => [
                [
                    'label' => 'New Registrations',
                    'data' => $values,
                    'color' => 'success',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
            'scales' => [
                'x' => [
                    'grid' => ['display' => false],
                    'ticks' => [
                        'maxTicksLimit' => 7,
                        'font' => ['size' => 9],
                    ],
                ],
                'y' => [
                    'beginAtZero' => true,
                    'grid' => ['color' => 'rgba(255, 255, 255, 0.05)'],
                    'ticks' => [
                        'font' => ['size' => 9],
                        'stepSize' => 1,
                    ],
                ],
            ],
        ];
    }
}
