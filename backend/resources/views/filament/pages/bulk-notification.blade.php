<div class="space-y-6">
    {{-- Header --}}
    <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 50)">
        <div x-show="show" x-transition:enter="transition duration-500 ease-out" x-transition:enter-start="-translate-y-4 opacity-0" x-transition:enter-end="translate-y-0 opacity-100">
            <h1 class="text-2xl font-bold tracking-tight text-white">Send Bulk Notification</h1>
            <p class="text-sm text-gray-400 mt-1">Compose and send notifications to targeted user segments</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
            <form wire:submit="sendNotifications" class="space-y-6">
                {{-- Target Audience Section --}}
                <div x-data="{ open: true }" class="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
                    <div class="flex items-center justify-between cursor-pointer px-6 pt-6 pb-4" @click="open = !open">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <x-filament::icon name="heroicon-o-users" class="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold text-white">Target Audience</h3>
                                <p class="text-xs text-gray-500">Define the recipients for this notification</p>
                            </div>
                        </div>
                        <x-filament::icon name="heroicon-o-chevron-down" class="h-5 w-5 text-gray-500 transition-transform duration-200" x-bind:class="{'rotate-180': open}" />
                    </div>

                    <div x-show="open" x-transition:enter="transition duration-300 ease-out" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100" class="px-6 pb-6 space-y-5">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1.5">Target Users</label>
                            <select wire:model.live="userFilter" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                                <option value="all">All Users</option>
                                <option value="has_package">Users with a Package</option>
                                <option value="no_package">Users without a Package</option>
                                <option value="by_package">Users by Package</option>
                                <option value="active">Active Users</option>
                                <option value="inactive">Inactive Users</option>
                            </select>
                        </div>

                        <div x-show="$wire.userFilter === 'by_package'" x-transition:enter="transition duration-300 ease-out" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" wire:key="package-list">
                            <label class="block text-sm font-medium text-gray-400 mb-2">Filter by Packages</label>
                            @php $packages = \App\Models\Package::orderBy('name')->pluck('name', 'id')->toArray(); @endphp
                            <div class="grid grid-cols-2 gap-2">
                                @foreach($packages as $id => $name)
                                    <label class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-150 cursor-pointer">
                                        <input type="checkbox" wire:model.live="selectedPackages" value="{{ $id }}" class="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-150">
                                        {{ $name }}
                                    </label>
                                @endforeach
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1.5">Active Users Only</label>
                            <label class="inline-flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" wire:model.live="activeOnly" class="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-150 group-hover:border-blue-400">
                                <span class="text-sm text-gray-300 group-hover:text-white transition-colors duration-150">Yes</span>
                            </label>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-1.5">Registered From</label>
                                <input type="date" wire:model.live="registeredFrom" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-1.5">Registered To</label>
                                <input type="date" wire:model.live="registeredTo" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Message Section --}}
                <div x-data="{ open: true }" class="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
                    <div class="flex items-center justify-between cursor-pointer px-6 pt-6 pb-4" @click="open = !open">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <x-filament::icon name="heroicon-o-envelope" class="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold text-white">Message</h3>
                                <p class="text-xs text-gray-500">Compose the notification content</p>
                            </div>
                        </div>
                        <x-filament::icon name="heroicon-o-chevron-down" class="h-5 w-5 text-gray-500 transition-transform duration-200" x-bind:class="{'rotate-180': open}" />
                    </div>

                    <div x-show="open" x-transition:enter="transition duration-300 ease-out" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100" class="px-6 pb-6 space-y-5">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1.5">Message <span class="text-red-400">*</span></label>
                            <textarea wire:model="message" rows="5" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" placeholder="Enter notification message..." maxlength="5000" required></textarea>
                            <div class="flex justify-between mt-1.5">
                                <p class="text-xs text-gray-500">Characters</p>
                                <p class="text-xs" x-data="{ count: 0 }" x-init="$watch('$wire.message', val => count = (val || '').length)">
                                    <span x-text="count" class="text-gray-300"></span><span class="text-gray-500"> / 5000</span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1.5">URL <span class="text-gray-600">(optional)</span></label>
                            <input type="url" wire:model="url" class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" placeholder="https://example.com">
                        </div>
                    </div>
                </div>

                {{-- Action Bar --}}
                <div class="rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-gray-900/80 p-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-400">
                                Will be sent to
                                <span class="font-semibold text-white" x-data="{ count: 0 }" x-init="$watch('$wire.previewCount', val => { let i = count; let step = Math.max(1, Math.floor((val - i) / 20)); let interval = setInterval(() => { i += step; if (i >= val) { i = val; clearInterval(interval); } count = i; }, 20); })" x-text="count">0</span>
                                users
                            </p>
                            <template x-if="$wire.sent && !$wire.sending">
                                <p class="text-xs text-green-400 mt-1">
                                    <span class="inline-flex items-center gap-1">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                        Notification sent successfully
                                    </span>
                                </p>
                            </template>
                        </div>
                        <div class="flex items-center gap-3">
                            <template x-if="$wire.sending">
                                <div class="flex items-center gap-2 text-sm text-blue-400">
                                    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </div>
                            </template>
                            <x-filament::button type="submit" color="primary" icon="heroicon-o-envelope" :disabled="$previewCount === 0 || $sending">
                                <span x-show="!$wire.sending">Send Notification</span>
                                <span x-show="$wire.sending">
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" viewBox="0 0 24 24" fill="none">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </span>
                            </x-filament::button>
                        </div>
                    </div>
                </div>

                {{-- Progress Bar --}}
                <div x-show="$wire.sending" x-transition:enter="transition duration-300" class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="flex items-center gap-2 text-sm text-blue-400">
                            <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending notifications...
                        </span>
                        <span class="text-sm text-blue-400 font-mono" x-text="`${$wire.processedCount} / ${$wire.totalCount}`"></span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
                            x-bind:style="`width: ${Math.round(($wire.processedCount / Math.max($wire.totalCount, 1)) * 100)}%`">
                        </div>
                    </div>
                </div>
            </form>
        </div>

        {{-- Sidebar --}}
        <div class="space-y-6">
            <div x-data="{ show: false }" x-init="setTimeout(() => show = true, 200)" x-show="show" x-transition:enter="transition duration-500 delay-150" x-transition:enter-start="opacity-0 translate-x-4" x-transition:enter-end="opacity-100 translate-x-0">
                <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <x-filament::icon name="heroicon-o-information-circle" class="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-white">Instructions</h3>
                            <p class="text-xs text-gray-500">Follow these steps to send</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex gap-3 items-start group">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-200 flex-shrink-0 mt-0.5">
                                <x-filament::icon name="heroicon-o-funnel" class="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">Choose Audience</p>
                                <p class="text-xs text-gray-500 mt-0.5">Select the target audience using the filters above</p>
                            </div>
                        </div>
                        <div class="flex gap-3 items-start group">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200 flex-shrink-0 mt-0.5">
                                <x-filament::icon name="heroicon-o-pencil" class="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">Write Message</p>
                                <p class="text-xs text-gray-500 mt-0.5">Compose your notification message (max 5000 characters)</p>
                            </div>
                        </div>
                        <div class="flex gap-3 items-start group">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-200 flex-shrink-0 mt-0.5">
                                <x-filament::icon name="heroicon-o-link" class="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">Add URL <span class="text-gray-500 font-normal">(optional)</span></p>
                                <p class="text-xs text-gray-500 mt-0.5">Include a link for users to click through</p>
                            </div>
                        </div>
                        <div class="flex gap-3 items-start group">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors duration-200 flex-shrink-0 mt-0.5">
                                <x-filament::icon name="heroicon-o-paper-airplane" class="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200">Send</p>
                                <p class="text-xs text-gray-500 mt-0.5">Review the recipient count and click Send</p>
                            </div>
                        </div>
                    </div>

                    {{-- Recipients Counter --}}
                    <div class="mt-6 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900/50 p-5 border border-gray-700/50">
                        <div class="flex items-center gap-2 mb-1">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <x-filament::icon name="heroicon-o-users" class="h-4 w-4 text-blue-400" />
                            </div>
                            <p class="text-sm font-medium text-gray-300">Recipients</p>
                        </div>
                        <p class="text-3xl font-bold text-white mt-3" x-data="{ count: 0 }" x-init="
                            $watch('$wire.previewCount', function(val) {
                                let start = count;
                                let end = val;
                                let duration = 600;
                                let startTime = null;
                                function animate(timestamp) {
                                    if (!startTime) startTime = timestamp;
                                    let progress = Math.min((timestamp - startTime) / duration, 1);
                                    count = Math.floor(start + (end - start) * easeOutCubic(progress));
                                    if (progress < 1) requestAnimationFrame(animate);
                                }
                                function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
                                requestAnimationFrame(animate);
                            });
                        " x-text="count">0</p>
                        <div class="mt-3 flex items-center gap-2">
                            <span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-xs text-gray-500">Live count — updates as you filter</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>