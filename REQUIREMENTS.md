# MLM Saudi Platform — Requirements Document

> **Generated:** May 9, 2026 — based on full codebase analysis (backend + frontend)

---

## 1. Project Overview

**MLM Saudi** is a full-stack Multi-Level Marketing (MLM) platform with a **binary MLM compensation plan**. It enables user registration via sponsorship, package-based purchasing, commission earnings (referral, binary matching, generation), and withdrawal processing. The admin can manage settings, users, and platform configuration via a Filament admin panel.

| Property | Value |
|----------|-------|
| **Frontend** | Next.js 16.2.6, React 19.2.4, TypeScript 5, Tailwind CSS 4, Zustand, Recharts, Framer Motion, Radix UI |
| **Backend** | Laravel 12.x, PHP 8.x, Sanctum (API tokens) |
| **Database** | SQLite (dev), MySQL/MariaDB/PgSQL/SQL Server supported |
| **Auth** | Sanctum token-based, multi-field login (email or phone), OTP, 2FA |
| **Admin** | Filament PHP panel at `/admin` |
| **API Style** | RESTful JSON |
| **State** | Zustand stores: `auth-store` (persisted), `settings-store` (fetched), `app-store` (sidebar/theme) |

---

## 2. Database Schema (24 tables)

### 2.1 Core User Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | auto-increment |
| name | varchar(255) | required |
| email | varchar(255) | unique |
| phone | varchar(255) | unique, nullable |
| username | varchar(255) | unique, nullable, auto-generated |
| password | varchar(255) | hashed |
| sponsor_id | bigint unsigned FK→users | nullable, self-referencing |
| package_id | bigint unsigned FK→packages | nullable |
| is_active | boolean | default true |
| is_verified | boolean | default false |
| two_factor_enabled | boolean | default false |
| two_factor_secret | varchar(255) | nullable, hashed |
| avatar | varchar(255) | nullable |
| country, city, address | varchar/text | nullable |
| date_of_birth | date | nullable |
| gender | varchar(255) | nullable |
| last_login_at | timestamp | nullable |
| last_login_ip | varchar(255) | nullable |
| email_verified_at, phone_verified_at | timestamp | nullable |

**Relationships:** wallet(1:1), sponsor(self-ref), package, binaryPosition(1:1), referrals(1:N), commissions(1:N), withdrawals(1:N), walletTransactions(1:N), deviceSessions(1:N)

#### `password_reset_tokens`
| email PK | token | created_at |

#### `sessions`
| id PK | user_id FK→users | ip_address | user_agent | payload | last_activity |

### 2.2 Package & Wallet Tables

#### `packages`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| name | varchar(255) | e.g., Starter, Silver, Gold, Platinum |
| price | decimal(18,8) | |
| daily_income | decimal(18,8) | ROI per day |
| binary_bonus_percent | decimal(5,2) | % for binary matching |
| referral_bonus_percent | decimal(5,2) | % for direct referrals |
| generation_bonus_percent | decimal(5,2) | % for generation bonuses |
| duration_days | int | default 365 |
| is_active | boolean | |
| sort_order | int | |

**Relationships:** hasMany users

#### `wallets`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | bigint unsigned FK→users | unique per user |
| balance | decimal(18,8) | total balance |
| income_balance | decimal(18,8) | earnings balance |
| bonus_balance | decimal(18,8) | bonus earnings |
| withdrawable_balance | decimal(18,8) | available for withdrawal |
| total_deposited | decimal(18,8) | lifetime deposits |
| total_withdrawn | decimal(18,8) | lifetime withdrawals |
| total_income | decimal(18,8) | lifetime earnings |

**Custom Methods:** `credit(amount, type, description, metadata)`, `debit(amount, type, description, metadata)` — both throw `InsufficientBalanceException` on insufficient funds.

#### `wallet_transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | FK→users | |
| wallet_id | FK→wallets | |
| type | varchar(255) | deposit, withdrawal, commission, transfer, etc. |
| amount | decimal(18,8) | |
| fee | decimal(18,8) | |
| balance_before | decimal(18,8) | |
| balance_after | decimal(18,8) | |
| status | varchar(255) | pending, completed, failed, cancelled |
| reference_type | varchar(255) | nullable, polymorphic link |
| reference_id | bigint unsigned | nullable |
| description | text | nullable |
| metadata | json | nullable |
| transaction_id | varchar(255) | unique UUID |
| completed_at | timestamp | nullable |

### 2.3 MLM Binary Tree Table

#### `binary_positions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | FK→users | unique |
| parent_id | FK→users | nullable, self-ref |
| position | varchar(255) | 'A' (left) or 'B' (right) |
| path | varchar(255) | indexed, ancestry path |
| level | int | depth level |
| left_bv | decimal(18,8) | left leg business volume |
| right_bv | decimal(18,8) | right leg business volume |
| carry_forward_left | decimal(18,8) | BV carried to next period |
| carry_forward_right | decimal(18,8) | BV carried to next period |
| total_left_members | int | |
| total_right_members | int | |
| active_left_members | int | |
| active_right_members | int | |

### 2.4 Commission & Withdrawal Tables

#### `commissions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | FK→users | |
| from_user_id | FK→users | nullable, source of commission |
| type | varchar(255) | binary, referral, generation, daily_task |
| amount | decimal(18,8) | |
| percentage | decimal(5,2) | rate applied |
| status | varchar(255) | pending, paid, cancelled |
| description | varchar(255) | nullable |
| metadata | json | nullable |
| credited_at | timestamp | nullable |

#### `withdrawals`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | FK→users | |
| amount | decimal(18,8) | requested amount |
| fee | decimal(18,8) | processing fee |
| net_amount | decimal(18,8) | amount after fee |
| payment_method | varchar(255) | bkash, nagad, bank, USDT, BTC, ETH |
| account_number | varchar(255) | |
| account_holder | varchar(255) | nullable |
| status | varchar(255) | pending, approved, rejected, completed, cancelled |
| admin_note | text | nullable |
| approved_by | FK→users | nullable |
| approved_at, completed_at | timestamp | nullable |
| metadata | json | nullable |

### 2.5 Daily Tasks Tables

#### `daily_tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| title | varchar(255) | |
| description | text | nullable |
| reward | decimal(18,8) | |
| type | varchar(255) | daily, weekly, one_time |
| requirements | json | nullable, task completion criteria |
| is_active | boolean | |

#### `task_completions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| user_id | FK→users | |
| daily_task_id | FK→daily_tasks | |
| completed_date | date | |
| reward_claimed | boolean | |
| claimed_at | timestamp | nullable |

**Unique Key:** `(user_id, daily_task_id, completed_date)`

### 2.6 System Tables

#### `settings`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned PK | |
| key | varchar(255) | unique |
| value | text | nullable |
| group | varchar(255) | general, branding, dashboard, etc. |
| type | varchar(255) | string, boolean, number, json |
| is_public | boolean | publicly accessible via API |
| description | varchar(255) | nullable |

~114 default settings across 10 groups (general, branding, landing, theme, features, dashboard, announcements, social, cms, seo).

#### `notifications` (polymorphic)
| id UUID PK | type | notifiable_id | notifiable_type | data (text) | read_at | timestamps |

#### `device_sessions`
| id PK | user_id FK→users | device_name | device_type | platform | browser | ip_address | user_agent | location | is_current | last_activity |

#### `audit_logs` (polymorphic)
| id PK | user_id FK→users (nullable) | action | module | auditable_id | auditable_type | old_values (json) | new_values (json) | ip_address | user_agent | created_at |

#### `personal_access_tokens` (Sanctum)
| id PK | tokenable_id | tokenable_type | name | token (unique, 64-char hash) | abilities (text) | last_used_at | expires_at | timestamps |

#### Cache/Queue tables: `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`

#### Telescope tables: `telescope_entries`, `telescope_entries_tags`, `telescope_monitoring`

---

## 3. API Endpoints

### 3.1 Authentication (public)
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| POST | `/api/auth/register` | AuthController@register | Create account with name, email, phone, password, sponsor_code, package_id, position |
| POST | `/api/auth/login` | AuthController@login | Multi-field login (email or phone) + password |
| POST | `/api/auth/forgot-password` | AuthController@forgotPassword | Request password reset (placeholder) |
| POST | `/api/auth/reset-password` | AuthController@resetPassword | Execute password reset (placeholder) |
| GET | `/api/settings` | SettingsController@index | Get all public settings (unauthenticated) |

### 3.2 Authenticated User
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/auth/me` | AuthController@me | Get profile with wallet, package, binary position, sponsor |
| POST | `/api/auth/logout` | AuthController@logout | Revoke all tokens |
| PUT | `/api/auth/profile` | AuthController@updateProfile | Update name, phone, avatar, country, city, address, DOB, gender |
| POST | `/api/auth/send-otp` | AuthController@sendOTP | Generate & cache 6-digit OTP (phone verification) |
| POST | `/api/auth/verify-otp` | AuthController@verifyOTP | Verify OTP, mark phone verified |
| POST | `/api/auth/2fa/enable` | AuthController@enable2FA | Enable 2FA with secret |
| POST | `/api/auth/2fa/verify` | AuthController@verify2FA | Verify 2FA code |

### 3.3 Dashboard
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/dashboard` | DashboardController@index | Aggregated: wallet, balances, team stats, binary legs, recent transactions, income chart (30d), trends, unread notifications |

### 3.4 Wallet
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/wallet` | WalletController@index | Get user wallet |
| GET | `/api/wallet/transactions` | WalletController@transactions | Filtered/paginated (type, status, date range) |
| GET | `/api/wallet/history` | WalletController@history | Income summary by type |
| POST | `/api/wallet/deposit` | WalletController@deposit | Record deposit (amount, payment_method, transaction_id) |

### 3.5 Withdrawals
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/withdrawals` | WithdrawalController@index | List user withdrawals |
| POST | `/api/withdrawals` | WithdrawalController@store | Create withdrawal request (amount, payment_method, account_number) |
| GET | `/api/withdrawals/{id}` | WithdrawalController@show | Single withdrawal detail |
| POST | `/api/withdrawals/{id}/cancel` | WithdrawalController@cancel | Cancel pending withdrawal (refunds wallet) |

### 3.6 Binary Tree
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/binary/tree` | BinaryController@index | Binary tree with depth parameter |
| GET | `/api/binary/genealogy` | BinaryController@genealogy | Full genealogy with max depth |
| GET | `/api/binary/stats` | BinaryController@stats | User's binary position stats |

### 3.7 Commissions
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/commissions` | CommissionController@index | Filtered/paginated commissions |
| GET | `/api/commissions/summary` | CommissionController@summary | Aggregated totals by type |

### 3.8 Notifications
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/notifications` | NotificationController@index | Paginated notifications |
| POST | `/api/notifications/{id}/read` | NotificationController@markAsRead | Mark single read |
| POST | `/api/notifications/read-all` | NotificationController@markAllAsRead | Mark all read |

### 3.9 Daily Tasks
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/api/daily-tasks` | DailyTaskController@index | Active tasks with completion status |
| POST | `/api/daily-tasks/{id}/complete` | DailyTaskController@complete | Mark task completed |
| POST | `/api/daily-tasks/{id}/claim` | DailyTaskController@claimReward | Claim task reward |

### 3.10 Admin
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| POST | `/api/settings/flush` | SettingsController@flush | Flush settings cache |
| POST | `/api/admin/impersonate/{user}` | AdminController@impersonate | Generate 5-min token as another user |

---

## 4. Frontend Routes & Pages

### 4.1 Public (auth) Routes
| Route | Page | Key Features |
|-------|------|-------------|
| `/login` | Login | Email/password, remember me, show/hide password |
| `/register` | Registration | 4 package tiers (Starter/Silver/Gold/Platinum), binary position (A/B), sponsor code from URL `?ref=` |
| `/forgot-password` | Forgot Password | Email input, success state |
| `/reset-password` | Reset Password | Token from URL, new password + confirmation, error states |
| `/verify-otp` | OTP Verification | 6-digit input, auto-focus, paste support, countdown timer (120s), resend |

### 4.2 Authenticated (dashboard) Routes
| Route | Page | Data Source | Key Features |
|-------|------|-------------|-------------|
| `/dashboard` | Main Dashboard | `GET /api/dashboard` (real) | 4 stat cards, income chart (30d), wallet overview, team overview, recent transactions, quick actions, announcement banner |
| `/wallet` | Wallet | Mock/placeholder | Balance cards, transaction history with tabs, deposit form |
| `/commissions` | Commissions | Mock/placeholder | Summary cards, filterable history (all/binary/referral/level/matching) |
| `/genealogy` | Genealogy Tree | Mock/placeholder | Hierarchical expandable tree, search, pagination |
| `/binary-tree` | Binary Tree | Mock/placeholder | Visual binary tree, zoom in/out/reset, search, color-coded |
| `/withdrawals` | Withdrawals | Mock/placeholder | Amount form, payment method selection, fee calc (2%), history with tabs |
| `/daily-tasks` | Daily Tasks | Mock/placeholder | Gamified: complete/claim workflow, streak, progress bars |
| `/notifications` | Notifications | `GET /api/notifications` (real) | List, mark read individually/all, type-based icons |
| `/settings` | Settings | Mock/placeholder | 4 tabs: Profile, Security (password/2FA), Notifications (email/sms/push toggles), Sessions (device list) |
| `/` (root) | Landing Page | Settings-driven | Hero, Features grid, How It Works, Pricing, Testimonials, FAQ, Footer |

### 4.3 Layout
- **Auth layout**: Centered card with gradient background
- **Dashboard layout**: Auth guard (validates token via `GET /api/auth/me`), sidebar + header + scrollable content
- **Root layout**: Fonts (Inter + Plus Jakarta Sans), metadata, Providers wrapper

---

## 5. MLM Business Logic

### 5.1 Binary MLM Compensation Plan
| Concept | Implementation |
|---------|---------------|
| **Tree Structure** | Binary (2-leg) tree with Left (A) and Right (B) positions |
| **Placement** | Auto-placement under sponsor; finds weakest side; auto-spills down if occupied |
| **Path Tracking** | String-based path column for ancestry lookups |
| **Business Volume (BV)** | Added to all ancestors on user registration/package purchase |
| **Binary Matching** | Matches left BV vs right BV; smaller side determines matchable volume |
| **Carry Forward** | Excess BV carried to next matching cycle (configurable) |
| **Daily Flush** | Option to flush unmatched BV daily (configurable) |
| **Max Depth** | Binary bonus calculated up to configurable depth (default 20 levels) |

### 5.2 Commission Types
| Type | Calculation | Source |
|------|------------|--------|
| **Referral Bonus** | % of referred user's package price | `mlm.commission.referral.default_percentage` (default 10%) or package's `referral_bonus_percent` |
| **Binary Matching Bonus** | Matched BV × package's `binary_bonus_percent` / 100 | `mlm.binary.matching_percentage` (default 10%) |
| **Generation Bonus** | Downline earnings × tiered percentages | 3 levels: Level 1 = 5%, Level 2 = 3%, Level 3 = 1% |
| **Daily Task Reward** | Fixed reward amount per task | `daily_tasks.reward` |

### 5.3 Wallet Balance Types
| Balance | Description |
|---------|-------------|
| `balance` | Total balance (inclusive of all) |
| `income_balance` | Income/earnings |
| `bonus_balance` | Bonus earnings |
| `withdrawable_balance` | Available for withdrawal |

### 5.4 Withdrawal Rules
| Rule | Value (Default) | Config Key |
|------|----------------|------------|
| Minimum amount | $10 | `mlm.withdrawal.minimum_amount` |
| Maximum amount | $10,000 | `mlm.withdrawal.maximum_amount` |
| Fee | 2% | `mlm.withdrawal.fee_percentage` |
| Daily limit | $5,000 | `mlm.withdrawal.daily_limit` |
| Cooldown between withdrawals | 24 hours | `mlm.withdrawal.cooldown_hours` |
| Fraud detection | >5 withdrawals/24h OR new user (<1 day) withdrawing >$100 | hardcoded in WithdrawalService |

### 5.4 Withdrawal Status Transitions
```
pending → approved → completed
pending → rejected (wallet refunded)
pending → cancelled (wallet refunded, user-initiated)
```

---

## 6. User Roles

| Role | Authentication | Authorization | Notes |
|------|---------------|---------------|-------|
| **Member** | Sanctum token (via login/register) | Can access own data only | All standard users |
| **Admin** | Email ends with `@mlmpro.com` | `canAccessPanel()` for Filament; `isAdmin()` check on User model | Full Filament admin panel access |

*Note: No RBAC/role/permission system exists beyond the email-based admin check.*

---

## 7. Admin Panel (Filament)

| Feature | Description |
|---------|-------------|
| **Panel ID** | `admin` |
| **Path** | `/admin` |
| **Brand** | "MLM Pro" |
| **Login** | Filament built-in |
| **Color** | Blue (primary) |
| **Widgets** | AccountWidget, AdminStatsOverviewWidget, RecentRegistrationsWidget, RecentLoginsWidget, FilamentInfoWidget |
| **Resources** | Auto-discovers from `app/Filament/Resources/` |

---

## 8. Key Business Rules

1. **Username Auto-Generation**: Sanitized name + numeric counter if taken.
2. **Sponsor Chain**: Each user (except root) has exactly one sponsor, forming a binary tree.
3. **Package Required**: Registration requires a package selection.
4. **Binary Position**: Users are placed in the binary tree under their sponsor, auto-assigned to the weaker leg or a user-chosen side.
5. **BV Distribution**: When a user joins/purchases, BV is distributed up the entire ancestor chain.
6. **Commission Crediting**: All commissions credit the user's wallet immediately and create a database notification.
7. **Withdrawal Validation**: Minimum/maximum amount, daily limit, cooldown period, fraud detection, and sufficient withdrawable balance are all checked.
8. **2FA**: Optional TOTP-like 2FA with hashed secret storage.
9. **Settings-Driven UI**: All frontend labels, visibility toggles, colors, and text are configurable via the settings table (no hardcoded strings).
10. **Audit Trail**: All significant actions are logged in `audit_logs` with old/new values.

---

## 9. Security Requirements

| Area | Implementation |
|------|---------------|
| **Password Storage** | bcrypt hashing (Laravel default) |
| **API Auth** | Sanctum token-based (Bearer token via Authorization header + cookie) |
| **CORS** | Sanctum stateful domains: localhost:3000, localhost:8000 |
| **OTP** | 6-digit, cached with configurable expiry (default 5 min) |
| **2FA Secret** | Stored hashed (bcrypt), not plaintext |
| **Token Expiry** | No expiry for auth tokens; impersonation tokens expire in 5 min |
| **Fraud Detection** | Withdrawal frequency and new-user amount thresholds |
| **Auth Guard** | Dashboard layout validates token server-side on every navigation |
| **Admin Authorization** | Email-based domain check (`@mlmpro.com`) |

---

## 10. Frontend Architecture

### 10.1 State Management (Zustand)
| Store | Persisted | Key Data |
|-------|-----------|----------|
| `auth-store` | Yes (localStorage) | user, token, isAuthenticated |
| `settings-store` | No | All public settings (key-value map) |
| `app-store` | No | sidebarOpen, theme |

### 10.2 Settings-Driven Configuration
- **Feature toggles**: binary_enabled, referral_enabled, daily_tasks_enabled, withdrawal_enabled
- **Visibility toggles**: show_income_chart, show_wallet_overview, show_recent_transactions, show_team_tree
- **All text labels**: every stat card, chart title, wallet label, team label, transaction label, action label, welcome text, error text
- **Branding**: app_name, logo, colors, font
- **Theme**: primary_color, secondary_color, dark_mode, border_radius
- **Announcements**: enabled, text, type (info/warning/danger/announcement)

### 10.3 Gap Analysis — Frontend Pages Still Using Mock Data
The following pages currently **simulate API responses** with `setTimeout` or hardcoded data rather than calling real endpoints:

| Page | Missing Backend Integration |
|------|---------------------------|
| `/wallet` | `wallet/transactions`, `wallet/history`, `wallet/deposit` exist in API but frontend uses mock data |
| `/commissions` | `commissions`, `commissions/summary` exist in API but frontend uses mock data |
| `/genealogy` | `binary/genealogy` exists in API but frontend uses mock data |
| `/binary-tree` | `binary/tree` exists in API but frontend uses mock data |
| `/withdrawals` | `withdrawals` endpoints exist in API but frontend uses simulated data |
| `/daily-tasks` | `daily-tasks` endpoints exist in API but frontend uses simulated data |
| `/settings` | `auth/profile` exists but frontend uses local store updates only |

---

## 11. Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| User registration with binary placement | ✅ Backend complete | Frontend registration page works, uses API |
| Login with email/phone | ✅ Backend complete | Frontend login page works |
| OTP verification | ✅ Backend complete | Frontend page exists but uses simulated response |
| 2FA enable/verify | ✅ Backend complete | No frontend UI for setup |
| Main dashboard with real data | ✅ Both complete | Full integration: stats, chart, wallet, team, transactions, actions |
| Settings system (public API) | ✅ Both complete | Frontend reads settings, all labels configurable |
| Wallet CRUD with transactions | ✅ Backend complete | Frontend wallet page uses mock data |
| Binary tree placement & genealogy | ✅ Backend complete | Frontend uses mock data |
| Commission earning & summary | ✅ Backend complete | Frontend uses mock data |
| Withdrawal creation & lifecycle | ✅ Backend complete | Frontend uses simulated data |
| Daily tasks with rewards | ✅ Backend complete | Frontend uses simulated data |
| Notifications (database) | ✅ Both complete | Real API integration |
| Password reset | ⚠️ Placeholder only | Backend endpoints exist but no actual email sending |
| Email notifications | ❌ Not implemented | Only database notifications |
| Admin panel (Filament) | ⚠️ Scaffolded only | Panel config, no resources/widgets defined yet |
| RBAC / roles & permissions | ❌ Not implemented | Only email-based admin check |
| Landing page | ✅ Complete | Settings-driven, fully dynamic |
| Profile / settings page | ⚠️ Partial | Frontend UI exists, no real API integration |
| 2FA frontend setup UI | ❌ Not implemented | Backend supports, frontend missing |
| Multiple DB drivers in production | ⚠️ SQLite only | Code supports MySQL/PgSQL but currently using SQLite |

---

## 12. Technical Configuration

| Key | Value (dev default) |
|-----|---------------------|
| `DB_CONNECTION` | sqlite |
| `APP_URL` | http://localhost:8000 |
| `NEXT_PUBLIC_API_URL` | http://localhost:8000/api |
| Sanctum stateful domains | localhost:3000, localhost:8000 |
| Settings cache TTL | 3600 seconds (1 hour) |
| Impersonation token TTL | 5 minutes |
| Binary max depth | 20 levels |
| Binary carry forward | Enabled |
| Binary flush daily | Disabled |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **Binary** | Two-leg (left/right) tree structure where each user has exactly two placement positions |
| **BV (Business Volume)** | Points/value assigned to a user upon joining or purchasing, used for binary matching |
| **Sponsor** | The user who referred a new member (upline) |
| **Binary Matching** | Comparing left and right leg BV to determine commissionable volume |
| **Carry Forward** | Unmatched BV carried to the next commission cycle |
| **Generation Bonus** | Commission earned from downline's earnings, paid at diminishing percentages per level |
| **Withdrawable Balance** | Portion of wallet balance eligible for withdrawal |
| **Sanctum** | Laravel's lightweight API token authentication package |
| **Filament** | Admin panel framework for Laravel |
| **Zustand** | Lightweight React state management library |
