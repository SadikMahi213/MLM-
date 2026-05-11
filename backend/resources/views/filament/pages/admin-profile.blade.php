<div class="space-y-6">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-white">Admin Profile & Security</h1>
            <p class="text-sm text-gray-400 mt-1">Manage your account settings, security preferences, and sessions</p>
        </div>
    </div>

    {{-- User Info Card --}}
    <div class="rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-gray-900/80 p-6">
        <div class="flex items-center gap-6">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-2xl font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                @if($userData['avatar'])
                    <img src="{{ $userData['avatar'] }}" alt="Avatar" class="h-20 w-20 rounded-full object-cover">
                @else
                    {{ $userData['initials'] }}
                @endif
            </div>
            <div class="flex-1 min-w-0">
                <h2 class="text-xl font-bold text-white truncate">{{ $userData['name'] }}</h2>
                <p class="text-sm text-gray-400">{{ $userData['email'] }}</p>
                <div class="flex flex-wrap items-center gap-3 mt-3">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        <x-filament::icon name="heroicon-o-shield-check" class="h-3.5 w-3.5" />
                        {{ $userData['role'] }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <x-filament::icon name="heroicon-o-calendar" class="h-3.5 w-3.5" />
                        Since {{ $userData['member_since'] }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <x-filament::icon name="heroicon-o-clock" class="h-3.5 w-3.5" />
                        Last login: {{ $userData['last_login'] }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <x-filament::icon name="heroicon-o-globe-alt" class="h-3.5 w-3.5" />
                        IP: {{ $userData['last_ip'] }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {{-- Profile Information --}}
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <x-filament::icon name="heroicon-o-user" class="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h3 class="text-base font-semibold text-white">Profile Information</h3>
                    <p class="text-xs text-gray-500">Update your personal details</p>
                </div>
            </div>

            <form wire:submit="updateProfile" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                    <input type="text" wire:model="name"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                    @error('name') <p class="text-xs text-red-400 mt-1.5">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                    <input type="email" wire:model="email"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                    @error('email') <p class="text-xs text-red-400 mt-1.5">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">Phone Number</label>
                    <input type="text" wire:model="phone"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="+1 (555) 000-0000">
                    @error('phone') <p class="text-xs text-red-400 mt-1.5">{{ $message }}</p> @enderror
                </div>
                <div class="pt-2">
                    <button type="submit"
                        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-[0.97]">
                        <x-filament::icon name="heroicon-o-check" class="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>

        {{-- Change Password --}}
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <x-filament::icon name="heroicon-o-lock-closed" class="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                    <h3 class="text-base font-semibold text-white">Change Password</h3>
                    <p class="text-xs text-gray-500">Update your account password</p>
                </div>
            </div>

            <form wire:submit="updatePassword" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">Current Password</label>
                    <input type="password" wire:model="current_password"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="Enter current password">
                    @error('current_password') <p class="text-xs text-red-400 mt-1.5">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                    <input type="password" wire:model="new_password"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="Min. 8 characters">
                    @error('new_password') <p class="text-xs text-red-400 mt-1.5">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1.5">Confirm New Password</label>
                    <input type="password" wire:model="new_password_confirmation"
                        class="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="Re-enter new password">
                </div>
                <div class="pt-2">
                    <button type="submit"
                        class="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-yellow-500 active:scale-[0.97]">
                        <x-filament::icon name="heroicon-o-key" class="h-4 w-4" />
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- Two-Factor Authentication --}}
    <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg {{ $two_factor_enabled ? 'bg-green-500/10' : 'bg-gray-700' }}">
                <x-filament::icon name="heroicon-o-shield-check" class="h-5 w-5 {{ $two_factor_enabled ? 'text-green-400' : 'text-gray-500' }}" />
            </div>
            <div>
                <h3 class="text-base font-semibold text-white">Two-Factor Authentication</h3>
                <p class="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
            @if($two_factor_enabled)
                <span class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                    <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Enabled
                </span>
            @else
                <span class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gray-700 px-3 py-1 text-xs font-medium text-gray-400">
                    <span class="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                    Disabled
                </span>
            @endif
        </div>

        @if($two_factor_enabled && $two_factor_secret)
            <div class="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div class="flex items-start gap-3">
                    <x-filament::icon name="heroicon-o-key" class="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 class="text-sm font-medium text-yellow-400">2FA Setup Key</h4>
                        <p class="text-xs text-yellow-400/70 mt-1">Scan this secret with your authenticator app (Google Authenticator, Authy, etc.)</p>
                        <div class="mt-3 select-all rounded bg-gray-800 px-4 py-3 font-mono text-sm text-yellow-300 break-all border border-yellow-500/10">
                            {{ $two_factor_secret }}
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <div class="flex items-center justify-between">
            <div class="text-sm text-gray-400">
                @if($two_factor_enabled)
                    Two-factor authentication is <span class="text-green-400 font-medium">active</span> on your account.
                    @if($two_factor_secret)
                        Your setup key is shown above — save it if you haven't already.
                    @endif
                @else
                    Protect your account with an additional verification step during login.
                @endif
            </div>
            @if($two_factor_enabled)
                <button wire:click="disableTwoFactor"
                    class="inline-flex items-center gap-2 rounded-lg bg-red-600/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-600/20 active:scale-[0.97]">
                    <x-filament::icon name="heroicon-o-x-mark" class="h-4 w-4" />
                    Disable 2FA
                </button>
            @else
                <button wire:click="enableTwoFactor"
                    class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-500 active:scale-[0.97]">
                    <x-filament::icon name="heroicon-o-shield-check" class="h-4 w-4" />
                    Enable 2FA
                </button>
            @endif
        </div>
    </div>

    {{-- Active Sessions --}}
    <div class="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <div class="flex items-center gap-3 mb-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <x-filament::icon name="heroicon-o-device-phone-mobile" class="h-5 w-5 text-purple-400" />
            </div>
            <div>
                <h3 class="text-base font-semibold text-white">Active Sessions</h3>
                <p class="text-xs text-gray-500">Manage your active login sessions</p>
            </div>
        </div>

        <div class="space-y-3">
            @php
                $sessions = \App\Models\DeviceSession::where('user_id', Auth::id())
                    ->latest('last_activity')
                    ->limit(10)
                    ->get();
            @endphp

            @if($sessions->isEmpty())
                <div class="rounded-lg border border-dashed border-gray-700 p-8 text-center">
                    <x-filament::icon name="heroicon-o-device-phone-mobile" class="mx-auto h-8 w-8 text-gray-600" />
                    <p class="mt-2 text-sm text-gray-500">No active sessions found</p>
                </div>
            @else
                @foreach($sessions as $session)
                    <div class="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950/50 p-4">
                        <div class="flex items-center gap-3">
                            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800">
                                <x-filament::icon name="heroicon-o-device-phone-mobile" class="h-4 w-4 text-gray-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200">{{ $session->device_name ?? 'Unknown Device' }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ $session->ip_address ?? 'Unknown IP' }} &middot;
                                    {{ $session->last_activity ? \Carbon\Carbon::parse($session->last_activity)->diffForHumans() : 'Unknown' }}
                                    @if($session->is_current)
                                        &middot; <span class="text-green-400">Current session</span>
                                    @endif
                                </p>
                            </div>
                        </div>
                        @if(!$session->is_current)
                            <button onclick="confirm('Revoke this session?') || event.stopImmediatePropagation()"
                                wire:click="revokeSession({{ $session->id }})"
                                class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                Revoke
                            </button>
                        @endif
                    </div>
                @endforeach
            @endif
        </div>
    </div>
</div>
