<div class="space-y-6" x-data="{ dragOver: false, fileName: null }">
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 50)">
        <div x-show="show" x-transition:enter="transition duration-500 ease-out" x-transition:enter-start="-translate-y-4 opacity-0" x-transition:enter-end="translate-y-0 opacity-100">
            <h1 class="text-2xl font-bold tracking-tight text-white">Import Users from CSV</h1>
            <p class="text-sm text-gray-400">Bulk import users by uploading a CSV file</p>
        </div>
    </div>

    {{-- Results View --}}
    <div x-show="$wire.results && Object.keys($wire.results).length > 0"
         x-transition:enter="transition duration-500 ease-out"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         x-cloak>
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-white">Import Results</h3>
                <div class="flex items-center gap-1.5" x-data="{ show: false }" x-init="setTimeout(() => show = true, 300)" x-show="show" x-transition:enter="transition duration-500" x-transition:enter-start="opacity-0 scale-50">
                    <svg class="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <span class="text-green-400 text-sm font-medium">Complete</span>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="rounded-lg bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-700/30 p-5" x-data="{ count: 0 }" x-init="let end = {{ $results['imported'] ?? 0 }}; let i = 0; let interval = setInterval(() => { i++; if (i >= end) { i = end; clearInterval(interval); } count = i; }, 30)">
                    <p class="text-3xl font-bold text-green-400" x-text="count">0</p>
                    <p class="text-sm text-green-300 mt-1">Imported</p>
                </div>
                <div class="rounded-lg bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border border-yellow-700/30 p-5" x-data="{ count: 0 }" x-init="let end = {{ $results['skipped'] ?? 0 }}; let i = 0; let interval = setInterval(() => { i++; if (i >= end) { i = end; clearInterval(interval); } count = i; }, 30)">
                    <p class="text-3xl font-bold text-yellow-400" x-text="count">0</p>
                    <p class="text-sm text-yellow-300 mt-1">Skipped</p>
                </div>
                <div class="rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-700/30 p-5">
                    <p class="text-3xl font-bold text-blue-400">{{ number_format(($results['imported'] ?? 0) + ($results['skipped'] ?? 0)) }}</p>
                    <p class="text-sm text-blue-300 mt-1">Total Processed</p>
                </div>
            </div>

            @if(!empty($results['errors'] ?? []))
                <div class="mt-4 rounded-lg bg-red-900/10 border border-red-800/30 p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <x-filament::icon name="heroicon-o-exclamation-triangle" class="h-4 w-4 text-red-400" />
                        <h4 class="text-sm font-medium text-red-400">{{ count($results['errors'] ?? []) }} Error(s)</h4>
                    </div>
                    <div class="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                        @foreach(array_slice($results['errors'] ?? [], 0, 20) as $error)
                            <p class="text-xs text-red-300/80 font-mono">{{ $error }}</p>
                        @endforeach
                        @if(count($results['errors'] ?? []) > 20)
                            <p class="text-xs text-gray-500 pt-1">...and {{ count($results['errors'] ?? []) - 20 }} more errors</p>
                        @endif
                    </div>
                </div>
            @endif

            <x-filament::button wire:click="$set('results', [])" color="gray" icon="heroicon-o-arrow-path" class="mt-6">
                Import Another File
            </x-filament::button>
        </div>
    </div>

    {{-- Upload View --}}
    <div x-show="!$wire.results || Object.keys($wire.results).length === 0"
         x-transition:enter="transition duration-500 ease-out">
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <form wire:submit="importCsv" class="space-y-6">
                {{-- Drag & Drop Zone --}}
                <div
                    @dragover.prevent="dragOver = true"
                    @dragleave.prevent="dragOver = false"
                    @drop.prevent="dragOver = false; const file = $event.dataTransfer.files[0]; if (file) { $wire.set('csvFile', file); fileName = file.name; }"
                    x-bind:class="{
                        'border-blue-500 bg-blue-500/5': dragOver,
                        'border-gray-600 bg-gray-800': !dragOver && !$wire.csvFile,
                        'border-green-500/50 bg-green-500/5': $wire.csvFile
                    }"
                    class="relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer hover:border-blue-500/50"
                    @click="document.getElementById('csv-input').click()">

                    <template x-if="!$wire.csvFile && !dragOver">
                        <div>
                            <div class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gray-700/50">
                                <x-filament::icon name="heroicon-o-arrow-up-tray" class="h-7 w-7 text-gray-400" />
                            </div>
                            <p class="mt-4 text-sm text-gray-300">
                                <span class="font-semibold text-blue-400">Click to upload</span> or drag and drop
                            </p>
                            <p class="text-xs text-gray-500 mt-1">CSV files only (max 10MB)</p>
                        </div>
                    </template>

                    <template x-if="dragOver">
                        <div>
                            <div class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-blue-500/20">
                                <x-filament::icon name="heroicon-o-cloud-arrow-up" class="h-7 w-7 text-blue-400" />
                            </div>
                            <p class="mt-4 text-sm font-medium text-blue-400">Drop your CSV file here</p>
                        </div>
                    </template>

                    <template x-if="$wire.csvFile && !dragOver">
                        <div>
                            <div class="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-green-500/20">
                                <x-filament::icon name="heroicon-o-document-text" class="h-7 w-7 text-green-400" />
                            </div>
                            <p class="mt-4 text-sm font-medium text-green-400" x-text="fileName || 'File selected'"></p>
                            <p class="text-xs text-gray-500 mt-1">Click to change file</p>
                        </div>
                    </template>

                    <input id="csv-input" type="file" wire:model="csvFile" accept=".csv" class="hidden" @change="fileName = $event.target.files[0]?.name || null">
                    @error('csvFile') <p class="text-xs text-red-400 mt-3">{{ $message }}</p> @enderror
                </div>

                <div x-data="{ open: false }" class="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
                    <div class="flex items-center justify-between cursor-pointer" @click="open = !open">
                        <label class="text-sm font-medium text-gray-400 cursor-pointer">Default Package <span class="text-gray-600">(optional)</span></label>
                        <x-filament::icon name="heroicon-o-chevron-up" x-show="open" class="h-4 w-4 text-gray-500 transition-transform duration-200" />
                        <x-filament::icon name="heroicon-o-chevron-down" x-show="!open" class="h-4 w-4 text-gray-500 transition-transform duration-200" />
                    </div>
                    <div x-show="open" x-transition:enter="transition duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" class="mt-3">
                        <select wire:model="defaultPackageId" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                            <option value="">No default package</option>
                            @foreach(\App\Models\Package::all() as $package)
                                <option value="{{ $package->id }}">{{ $package->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <x-filament::button type="submit" color="primary" icon="heroicon-o-arrow-up-on-square" :disabled="!$csvFile || $importing" class="w-full sm:w-auto">
                    <span x-show="!$wire.importing">Import Users</span>
                    <span x-show="$wire.importing">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Importing...
                    </span>
                </x-filament::button>

                <div x-show="$wire.importing" x-transition:enter="transition duration-300" class="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-blue-400">Processing file...</span>
                        <span class="text-sm text-blue-400" x-text="`${$wire.importProgress}%`"></span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
                            x-bind:style="`width: ${$wire.importProgress}%`">
                        </div>
                    </div>
                </div>
            </form>
        </div>

        {{-- CSV Format Help --}}
        <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 250)" x-show="show" x-transition:enter="transition duration-500 delay-150" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0" class="rounded-xl border border-gray-700 bg-gray-900 p-6 mt-6">
            <div x-data="{ open: false }">
                <div class="flex items-center justify-between cursor-pointer" @click="open = !open">
                    <h3 class="text-base font-semibold text-white">CSV Format Reference</h3>
                    <x-filament::icon name="heroicon-o-chevron-up" x-show="open" class="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    <x-filament::icon name="heroicon-o-chevron-down" x-show="!open" class="h-5 w-5 text-gray-500 transition-transform duration-200" />
                </div>
                <div x-show="open" x-transition:enter="transition duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Required Columns</h4>
                        <ul class="space-y-2">
                            <li class="flex items-center gap-2 text-sm text-gray-300"><code class="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono text-blue-400">name</code> Full name</li>
                            <li class="flex items-center gap-2 text-sm text-gray-300"><code class="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono text-blue-400">email</code> Email address (must be unique)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Optional Columns</h4>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">phone</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">username</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">password</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">country</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">city</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">package_id</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">is_active</code></li>
                            <li class="flex items-center gap-2 text-sm text-gray-400"><code class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-mono text-yellow-400">is_verified</code></li>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
