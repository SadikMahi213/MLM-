<?php
    $colorClasses = [
        'primary' => 'text-blue-400',
        'success' => 'text-green-400',
        'warning' => 'text-yellow-400',
        'info' => 'text-purple-400',
        'danger' => 'text-red-400',
    ];

    $bgClasses = [
        'primary' => 'bg-blue-500/10',
        'success' => 'bg-green-500/10',
        'warning' => 'bg-yellow-500/10',
        'info' => 'bg-purple-500/10',
        'danger' => 'bg-red-500/10',
    ];

    $cardBgClasses = [
        'primary' => 'from-blue-500/10 to-transparent',
        'success' => 'from-green-500/10 to-transparent',
        'warning' => 'from-yellow-500/10 to-transparent',
        'info' => 'from-purple-500/10 to-transparent',
        'danger' => 'from-red-500/10 to-transparent',
    ];

    $periods = [
        'daily' => 'Daily',
        'weekly' => 'Weekly',
        'monthly' => 'Monthly',
    ];
?>
<div class="space-y-6">
    {{-- Header --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 50)">
        <div x-show="show" x-transition:enter="transition duration-500 ease-out" x-transition:enter-start="-translate-y-4 opacity-0" x-transition:enter-end="translate-y-0 opacity-100" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-white">Analytics & Reports</h1>
                <p class="text-sm text-gray-400">Comprehensive platform analytics and data export</p>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex rounded-lg overflow-hidden border border-gray-700 bg-gray-800 p-0.5">
                    @foreach($periods as $key => $label)
                        <button
                            wire:click="setPeriod('{{ $key }}')"
                            class="relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md {{ $period === $key ? 'text-white' : 'text-gray-400 hover:text-white' }}"
                        >
                            @if($period === $key)
                                <span class="absolute inset-0 rounded-md bg-blue-600 shadow-sm shadow-blue-600/50" x-data x-init="$el.classList.add('animate-in')"></span>
                            @endif
                            <span class="relative z-10">{{ $label }}</span>
                        </button>
                    @endforeach
                </div>
                <x-filament::button
                    wire:click="exportCsv"
                    color="success"
                    icon="heroicon-o-arrow-down-tray"
                    tag="button"
                >Export CSV</x-filament::button>
            </div>
        </div>
    </div>

    {{-- Loading Skeleton --}}
    <div x-show="$wire.loading" x-transition:enter="transition duration-200" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        @foreach(range(1, 10) as $i)
            <div class="rounded-xl border border-gray-700/50 bg-gray-900 p-5 animate-pulse">
                <div class="h-4 w-20 bg-gray-800 rounded mb-3"></div>
                <div class="h-8 w-28 bg-gray-800 rounded"></div>
            </div>
        @endforeach
    </div>

    {{-- Stat Cards --}}
    <div x-show="!$wire.loading" x-transition:enter="transition duration-500" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
         class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        @php
            $statCards = [
                ['label' => 'Total Users', 'value' => number_format($stats['total_users']), 'icon' => 'heroicon-o-users', 'color' => 'primary'],
                ['label' => 'Total Deposits', 'value' => '$' . number_format($stats['total_deposits'], 2), 'icon' => 'heroicon-o-banknotes', 'color' => 'success'],
                ['label' => 'Total Withdrawals', 'value' => '$' . number_format($stats['total_withdrawals'], 2), 'icon' => 'heroicon-o-arrow-up-tray', 'color' => 'warning'],
                ['label' => 'Total Commissions', 'value' => '$' . number_format($stats['total_commissions'], 2), 'icon' => 'heroicon-o-presentation-chart-bar', 'color' => 'info'],
                ['label' => 'Pending Withdrawals', 'value' => '$' . number_format($stats['pending_withdrawals'], 2), 'icon' => 'heroicon-o-clock', 'color' => 'danger'],
                ['label' => 'New Users (30d)', 'value' => number_format($stats['new_users_30d']), 'icon' => 'heroicon-o-user-plus', 'color' => 'primary'],
                ['label' => 'Deposits (30d)', 'value' => '$' . number_format($stats['deposits_30d'], 2), 'icon' => 'heroicon-o-banknotes', 'color' => 'success'],
                ['label' => 'Withdrawals (30d)', 'value' => '$' . number_format($stats['withdrawals_30d'], 2), 'icon' => 'heroicon-o-arrow-up-tray', 'color' => 'warning'],
                ['label' => 'Commissions (30d)', 'value' => '$' . number_format($stats['commissions_30d'], 2), 'icon' => 'heroicon-o-presentation-chart-bar', 'color' => 'info'],
                ['label' => 'Profit (30d)', 'value' => '$' . number_format($stats['profit_30d'], 2), 'icon' => 'heroicon-o-currency-dollar', 'color' => $stats['profit_30d'] >= 0 ? 'success' : 'danger'],
            ];
        @endphp
        @foreach($statCards as $i => $card)
            <div x-data="{ shown: false, count: 0 }"
                 x-init="setTimeout(() => { shown = true; }, {{ $i * 50 }});"
                 x-show="shown"
                 x-transition:enter="transition duration-500 ease-out"
                 x-transition:enter-start="opacity-0 translate-y-4"
                 x-transition:enter-end="opacity-100 translate-y-0"
                 class="relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br {{ $cardBgClasses[$card['color']] }} bg-gray-900 p-5 hover:border-gray-600 transition-all duration-300 group">
                <div class="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full {{ $bgClasses[$card['color']] }} opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-2xl"></div>
                <dt class="relative flex items-center gap-2 text-sm font-medium text-gray-400">
                    <x-filament::icon :name="$card['icon']" class="h-5 w-5 {{ $colorClasses[$card['color']] }}" />
                    {{ $card['label'] }}
                </dt>
                <dd class="relative mt-2 text-2xl font-semibold tracking-tight text-white">{{ $card['value'] }}</dd>
            </div>
        @endforeach
    </div>

    {{-- Chart Section --}}
    <div x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 400)" x-show="shown" x-transition:enter="transition duration-700 ease-out" x-transition:enter-start="opacity-0 translate-y-8" x-transition:enter-end="opacity-100 translate-y-0">
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    {{ ucfirst($period) }} Trend
                </h3>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-blue-500"></span> Users</span>
                    <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-green-500"></span> Deposits</span>
                    <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-yellow-500"></span> Withdrawals</span>
                    <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-purple-500"></span> Commissions</span>
                </div>
            </div>
            <div class="h-80 relative">
                <canvas id="reportChart"></canvas>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('livewire:init', function () {
    let chart = null;

    function initChart(data) {
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [
                    {
                        label: 'Registrations',
                        data: data.registrations || [],
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        pointBackgroundColor: '#3b82f6',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Deposits',
                        data: data.deposits || [],
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderColor: '#22c55e',
                        borderWidth: 2,
                        pointBackgroundColor: '#22c55e',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Withdrawals',
                        data: data.withdrawals || [],
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        borderColor: '#eab308',
                        borderWidth: 2,
                        pointBackgroundColor: '#eab308',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Commissions',
                        data: data.commissions || [],
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: '#8b5cf6',
                        borderWidth: 2,
                        pointBackgroundColor: '#8b5cf6',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true,
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f3f4f6',
                        bodyColor: '#d1d5db',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        boxPadding: 4,
                        usePointStyle: true,
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#9ca3af', maxTicksLimit: 12 },
                        grid: { color: '#374151', drawBorder: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af', callback: function(value) { if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k'; return '$' + value; } },
                        grid: { color: '#374151', drawBorder: false }
                    }
                }
            }
        });
    }

    Livewire.hook('component.init', ({ component }) => {
        if (component.name === 'filament.pages.reports') {
            const data = component.serverMemo.data.chartData;
            if (data) initChart(data);
        }
    });

    Livewire.hook('message.processed', (message, component) => {
        if (component.name === 'filament.pages.reports') {
            const data = component.serverMemo.data.chartData;
            if (data) initChart(data);
        }
    });
});
</script>
@endpush
