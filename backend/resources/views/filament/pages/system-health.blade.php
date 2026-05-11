<div class="space-y-8" x-data="{ autoRefresh: true }" x-init="
    let interval;
    if (autoRefresh) {
        interval = setInterval(() => {
            if (autoRefresh) $wire.refreshHealth();
        }, 60000);
    }
    $watch('autoRefresh', val => {
        if (val) {
            interval = setInterval(() => $wire.refreshHealth(), 60000);
        } else if (interval) {
            clearInterval(interval);
        }
    });
">
    {{-- Header --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 50)">
        <div x-show="show" x-transition:enter="transition duration-500 ease-out" x-transition:enter-start="-translate-y-4 opacity-0" x-transition:enter-end="translate-y-0 opacity-100" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-white">System Health</h1>
                <p class="text-sm text-gray-400 mt-1">Server status, application metrics, and diagnostic tools</p>
            </div>
            <div class="flex items-center gap-3">
                {{-- Auto-refresh toggle --}}
                <label class="flex items-center gap-2 cursor-pointer group" @click="autoRefresh = !autoRefresh">
                    <div class="relative">
                        <input type="checkbox" x-model="autoRefresh" class="sr-only peer">
                        <div class="w-9 h-5 rounded-full bg-gray-700 peer-checked:bg-blue-600 transition-colors duration-200"></div>
                        <div class="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 peer-checked:translate-x-4"></div>
                    </div>
                    <span class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Auto-refresh</span>
                </label>
                <x-filament::button wire:click="clearCache" color="gray" icon="heroicon-o-arrow-path" size="sm">
                    Clear Cache
                </x-filament::button>
                <x-filament::button wire:click="runMigration" color="warning" icon="heroicon-o-arrow-up-tray" size="sm">
                    Run Migrations
                </x-filament::button>
                <x-filament::button wire:click="refreshHealth" color="primary" icon="heroicon-o-arrow-path" size="sm" :disabled="$refreshing">
                    <span x-show="!$wire.refreshing">Refresh</span>
                    <span x-show="$wire.refreshing">
                        <svg class="animate-spin h-4 w-4 inline" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Refreshing...
                    </span>
                </x-filament::button>
            </div>
        </div>
    </div>

    {{-- Last refreshed --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 100)" x-show="show" x-transition:enter="transition duration-300" class="flex items-center gap-2 text-xs text-gray-600">
        <span class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-green-500" x-bind:class="{ 'animate-pulse': autoRefresh }"></span>
            Last refreshed: <span class="text-gray-400 font-mono" x-text="$wire.lastRefreshed || '—'"></span>
        </span>
        <template x-if="autoRefresh">
            <span class="text-gray-600">· Auto-refreshing every 60s</span>
        </template>
    </div>

    {{-- Critical Status Row --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 150)" x-show="show" x-transition:enter="transition duration-500 stagger-100" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        @php
            $critical = [
                ['label' => 'Database', 'value' => $health['db_status'], 'icon' => 'heroicon-o-circle-stack', 'ok' => $health['db_status'] === 'Connected'],
                ['label' => 'Cache', 'value' => $health['cache_status'], 'icon' => 'heroicon-o-bolt', 'ok' => $health['cache_status'] === 'Working'],
                ['label' => 'Environment', 'value' => ucfirst($health['environment']), 'icon' => 'heroicon-o-server', 'ok' => $health['environment'] === 'production'],
                ['label' => 'Last Cron', 'value' => $health['last_cron_run'], 'icon' => 'heroicon-o-clock', 'ok' => $health['last_cron_run'] !== 'Never'],
            ];
        @endphp
        @foreach($critical as $i => $c)
            <div x-data="{ shown: false }" x-init="setTimeout(() => shown = true, {{ 150 + $i * 100 }})" x-show="shown" x-transition:enter="transition duration-500 ease-out" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0"
                 class="relative overflow-hidden rounded-xl border {{ $c['ok'] ? 'border-green-500/20' : 'border-red-500/20' }} bg-gradient-to-br {{ $c['ok'] ? 'from-green-500/5' : 'from-red-500/5' }} bg-gray-900 p-5 transition-all duration-300 hover:border-opacity-50">
                <div class="flex items-start justify-between">
                    <div>
                        <dt class="flex items-center gap-2 text-sm font-medium {{ $c['ok'] ? 'text-green-400' : 'text-red-400' }}">
                            <x-filament::icon :name="$c['icon']" class="h-4 w-4" />
                            {{ $c['label'] }}
                        </dt>
                        <dd class="mt-2 text-xl font-semibold text-white">{{ $c['value'] }}</dd>
                    </div>
                    <div class="flex-shrink-0">
                        @if($c['ok'])
                            <div class="h-3 w-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse"></div>
                        @else
                            <div class="h-3 w-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-ping"></div>
                        @endif
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    {{-- Metrics Grid --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 400)" x-show="show" x-transition:enter="transition duration-700 ease-out" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Server Information --}}
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6 hover:border-gray-600 transition-all duration-300" x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 450)" x-show="shown" x-transition:enter="transition duration-500" x-transition:enter-start="opacity-0 translate-x-4">
            <h3 class="flex items-center gap-2 text-base font-semibold text-white mb-4">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <x-filament::icon name="heroicon-o-server" class="h-5 w-5 text-blue-400" />
                </div>
                Server Information
            </h3>
            <dl class="space-y-1">
                @php
                    $serverInfo = [
                        ['label' => 'PHP Version', 'value' => $health['php_version']],
                        ['label' => 'Laravel Version', 'value' => $health['laravel_version']],
                        ['label' => 'Server Time', 'value' => $health['server_time']],
                        ['label' => 'Timezone', 'value' => $health['timezone']],
                        ['label' => 'App URL', 'value' => $health['app_url']],
                        ['label' => 'App Name', 'value' => $health['app_name']],
                    ];
                @endphp
                @foreach($serverInfo as $item)
                    <div class="flex items-center justify-between py-2.5 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 rounded px-2 -mx-2 transition-colors duration-150">
                        <dt class="text-sm text-gray-400">{{ $item['label'] }}</dt>
                        <dd class="text-sm font-medium text-gray-200 truncate ml-4 max-w-[200px]" title="{{ $item['value'] }}">{{ $item['value'] }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>

        {{-- Performance & Cache --}}
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6 hover:border-gray-600 transition-all duration-300" x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 550)" x-show="shown" x-transition:enter="transition duration-500" x-transition:enter-start="opacity-0 translate-y-4">
            <h3 class="flex items-center gap-2 text-base font-semibold text-white mb-4">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                    <x-filament::icon name="heroicon-o-bolt" class="h-5 w-5 text-yellow-400" />
                </div>
                Performance & Cache
            </h3>
            <dl class="space-y-1">
                @php
                    $perfInfo = [
                        ['label' => 'Queue Connection', 'value' => ucfirst($health['queue_connection'])],
                        ['label' => 'Cache Driver', 'value' => ucfirst($health['cache_driver'])],
                        ['label' => 'Session Driver', 'value' => ucfirst($health['session_driver'])],
                        ['label' => 'Filesystem Driver', 'value' => ucfirst($health['filesystem_driver'])],
                        ['label' => 'Failed Jobs', 'value' => $health['failed_jobs'], 'warn' => $health['failed_jobs'] > 0],
                    ];
                @endphp
                @foreach($perfInfo as $item)
                    <div class="flex items-center justify-between py-2.5 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 rounded px-2 -mx-2 transition-colors duration-150">
                        <dt class="text-sm text-gray-400">{{ $item['label'] }}</dt>
                        <dd class="text-sm font-medium {{ isset($item['warn']) && $item['warn'] ? 'text-red-400' : 'text-gray-200' }}">
                            {{ $item['value'] }}
                            @if(isset($item['warn']) && $item['warn'])
                                <span class="inline-flex ml-1">
                                    <span class="h-2 w-2 rounded-full bg-red-500 animate-ping absolute"></span>
                                    <span class="h-2 w-2 rounded-full bg-red-500 relative"></span>
                                </span>
                            @endif
                        </dd>
                    </div>
                @endforeach
            </dl>
        </div>

        {{-- Platform Overview --}}
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6 hover:border-gray-600 transition-all duration-300" x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 650)" x-show="shown" x-transition:enter="transition duration-500" x-transition:enter-start="opacity-0 -translate-x-4">
            <h3 class="flex items-center gap-2 text-base font-semibold text-white mb-4">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <x-filament::icon name="heroicon-o-chart-bar" class="h-5 w-5 text-purple-400" />
                </div>
                Platform Overview
            </h3>
            <dl class="space-y-1">
                @php
                    $platformInfo = [
                        ['label' => 'Total Users', 'value' => number_format($health['user_count']), 'icon' => 'heroicon-o-users'],
                        ['label' => 'Packages', 'value' => $health['package_count'], 'icon' => 'heroicon-o-gift'],
                        ['label' => 'Pending Withdrawals', 'value' => $health['pending_withdrawals'], 'icon' => 'heroicon-o-clock', 'warn' => $health['pending_withdrawals'] > 0],
                    ];
                @endphp
                @foreach($platformInfo as $item)
                    <div class="flex items-center justify-between py-3.5 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 rounded px-2 -mx-2 transition-colors duration-150">
                        <dt class="flex items-center gap-2 text-sm text-gray-400">
                            <x-filament::icon :name="$item['icon']" class="h-4 w-4 text-gray-500" />
                            {{ $item['label'] }}
                        </dt>
                        <dd class="text-lg font-bold {{ isset($item['warn']) && $item['warn'] ? 'text-yellow-400' : 'text-blue-400' }}" x-data="{ count: 0 }" x-init="let end = {{ is_numeric($item['value']) ? $item['value'] : str_replace(',', '', $item['value']) }}; let i = 0; let interval = setInterval(() => { i += Math.ceil(end / 30); if (i >= end) { i = end; clearInterval(interval); } count = i; }, 30)" x-text="count.toLocaleString()">{{ $item['value'] }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>
    </div>

    {{-- Storage Section --}}
    <div x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 600)" x-show="shown" x-transition:enter="transition duration-700 ease-out" x-transition:enter-start="opacity-0 translate-y-8" x-transition:enter-end="opacity-100 translate-y-0">
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <x-filament::icon name="heroicon-o-hard-drive" class="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-white">Storage</h3>
                        <p class="text-xs text-gray-500">Disk usage on the application server</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-400">{{ $health['storage_used'] }} used</span>
                    <span class="text-gray-600">/</span>
                    <span class="text-gray-400">{{ $health['storage_total'] }} total</span>
                </div>
            </div>

            <div class="w-full bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner">
                @php $pct = $health['storage_percent']; @endphp
                <div
                    class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden {{ $pct > 80 ? 'bg-gradient-to-r from-red-500 to-red-400' : ($pct > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400') }}"
                    style="width: {{ max($pct, 1) }}%"
                >
                    <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
                </div>
            </div>

            <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-500">{{ $pct }}% utilized · {{ $health['storage_free'] }} free</span>
                @if($pct > 80)
                    <span class="flex items-center gap-1.5 text-xs text-red-400">
                        <span class="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                        <span class="h-2 w-2 rounded-full bg-red-500 absolute"></span>
                        <span class="ml-2">Critical — consider cleaning up or expanding storage</span>
                    </span>
                @elseif($pct > 60)
                    <span class="flex items-center gap-1.5 text-xs text-yellow-400">
                        <x-filament::icon name="heroicon-o-exclamation-triangle" class="h-3 w-3" />
                        Warning — approaching capacity
                    </span>
                @else
                    <span class="flex items-center gap-1.5 text-xs text-green-400">
                        <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Healthy
                    </span>
                @endif
            </div>
        </div>
    </div>

    {{-- Maintenance Actions --}}
    <div x-data="{ shown: false }" x-init="setTimeout(() => shown = true, 800)" x-show="shown" x-transition:enter="transition duration-700 ease-out" x-transition:enter-start="opacity-0 translate-y-8" x-transition:enter-end="opacity-100 translate-y-0">
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <x-filament::icon name="heroicon-o-wrench-screwdriver" class="h-5 w-5 text-orange-400" />
                </div>
                <div>
                    <h3 class="text-base font-semibold text-white">Maintenance Actions</h3>
                    <p class="text-xs text-gray-500">System maintenance and diagnostic tools</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="rounded-xl border border-gray-800 bg-gray-950/50 p-5 hover:border-gray-600 hover:bg-gray-900/80 transition-all duration-300 group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                            <x-filament::icon name="heroicon-o-arrow-path" class="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-white">Clear Cache</h4>
                            <p class="text-xs text-gray-500">Flush all application caches</p>
                        </div>
                    </div>
                    <x-filament::button wire:click="clearCache" color="primary" size="sm" outlined class="w-full">
                        Execute
                    </x-filament::button>
                </div>
                <div class="rounded-xl border border-gray-800 bg-gray-950/50 p-5 hover:border-gray-600 hover:bg-gray-900/80 transition-all duration-300 group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors duration-300">
                            <x-filament::icon name="heroicon-o-arrow-up-tray" class="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-white">Run Migrations</h4>
                            <p class="text-xs text-gray-500">Apply pending database migrations</p>
                        </div>
                    </div>
                    <x-filament::button wire:click="runMigration" color="warning" size="sm" outlined class="w-full">
                        Execute
                    </x-filament::button>
                </div>
                <div class="rounded-xl border border-gray-800 bg-gray-950/50 p-5 hover:border-gray-600 hover:bg-gray-900/80 transition-all duration-300 group">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300">
                            <x-filament::icon name="heroicon-o-arrow-path" class="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-white">Refresh Status</h4>
                            <p class="text-xs text-gray-500">Re-check all system metrics</p>
                        </div>
                    </div>
                    <x-filament::button wire:click="refreshHealth" color="success" size="sm" outlined class="w-full">
                        Execute
                    </x-filament::button>
                </div>
            </div>
        </div>
    </div>
</div>
