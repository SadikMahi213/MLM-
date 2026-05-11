# MLM Pro - Enterprise Multi-Level Marketing Platform

A world-class, enterprise-grade MLM SaaS platform built with modern fintech-level quality, beautiful UI/UX, scalable infrastructure, and mobile-first experience.

## Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Accessible UI components
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library
- **Recharts** - Charts
- **Zustand** - State management
- **Sonner** - Toast notifications
- **next-themes** - Dark/light mode

### Backend
- **Laravel 12** - PHP framework
- **PHP 8.4+** - Latest PHP
- **Filament v4** - Admin panel
- **Laravel Sanctum** - API authentication
- **Laravel Reverb** - WebSockets
- **Spatie Permissions** - Role management
- **Sentry** - Error monitoring

### Database & Cache
- **PostgreSQL 16** - Primary database
- **Redis 7** - Cache & queue
- **Meilisearch** - Full-text search

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Cloudflare** - CDN & security
- **Coolify** - Deployment

## Architecture

```
mlm-platform/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Console/Commands/   # Artisan commands
│   │   ├── Enums/              # PHP Enums
│   │   ├── Events/             # Event classes
│   │   ├── Exceptions/         # Custom exceptions
│   │   ├── Filament/           # Admin panel
│   │   │   ├── Pages/          # Dashboard pages
│   │   │   └── Resources/      # CRUD resources
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # API controllers
│   │   │   ├── Requests/Api/   # Form requests
│   │   │   └── Resources/      # API resources
│   │   ├── Jobs/               # Queue jobs
│   │   ├── Listeners/          # Event listeners
│   │   ├── Models/             # Eloquent models
│   │   ├── Notifications/      # Notifications
│   │   └── Services/           # Business logic
│   ├── config/                 # Configuration
│   ├── database/migrations/    # Schema migrations
│   └── routes/                 # API routes
├── frontend/                   # Next.js 16 App
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── (auth)/         # Auth pages
│       │   └── (dashboard)/    # Dashboard pages
│       ├── components/         # React components
│       │   ├── dashboard/      # Dashboard widgets
│       │   ├── layout/         # Layout components
│       │   └── ui/             # shadcn/ui components
│       ├── hooks/              # Custom hooks
│       ├── lib/                # Utilities
│       ├── stores/             # Zustand stores
│       └── types/              # TypeScript types
├── docker-compose.yml          # Docker orchestration
├── Dockerfile.backend          # Backend Dockerfile
├── Dockerfile.frontend         # Frontend Dockerfile
├── nginx.conf                  # Nginx configuration
└── .github/workflows/          # CI/CD pipelines
```

## Features

### 1. Authentication Module
- Email/phone login & registration
- OTP verification
- Password reset flow
- Device session management
- 2FA support
- Rate-limited login attempts

### 2. User Dashboard
- Real-time wallet balance
- Total income tracking
- Team member statistics
- Daily income chart
- Recent transactions
- Quick action buttons
- Mobile-responsive design

### 3. Binary MLM System
- A/B position joining
- Weak-side auto-placement
- Binary matching logic
- Carry forward balance
- Configurable match bonus
- Level-based downline

### 4. Referral/Genealogy System
- Materialized path hierarchy
- Recursive tree structure
- Team statistics
- Active/inactive member tracking
- Sponsor tree visualization
- Lazy loading for large trees

### 5. Wallet System
- Multi-balance wallet (main, income, bonus)
- Deposit & withdrawal management
- Transaction ledger
- Financial consistency (DB transactions)
- Audit trail for all movements

### 6. Commission Engine
- Binary matching bonus
- Referral bonus (% of package)
- Generation bonus (multi-level)
- Daily task rewards
- Carry forward balance
- Configurable percentages

### 7. Package System
- Multiple activation packages
- Admin configurable pricing
- Daily income per package
- Package upgrade support

### 8. Withdrawal System
- Multiple payment methods (bKash, Nagad, Bank)
- Fraud detection hooks
- Approval workflow
- Withdrawal limits & cooldown
- Automatic fee calculation

### 9. Notification System
- In-app real-time notifications
- Email notifications
- SMS integration ready
- Read/unread tracking

### 10. Daily Task System
- Admin configurable tasks
- Reward distribution
- Daily completion tracking
- Progress monitoring

### 11. Admin Panel (Filament)
- Member management
- Wallet oversight
- Income reports
- Withdrawal approval
- Analytics dashboard
- Settings management
- Audit log viewer

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get authenticated user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/send-otp` | Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/2fa/enable` | Enable 2FA |
| POST | `/api/auth/2fa/verify` | Verify 2FA |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard data |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Wallet details |
| GET | `/api/wallet/transactions` | Transaction history |
| GET | `/api/wallet/history` | Income history |
| POST | `/api/wallet/deposit` | Initiate deposit |

### Withdrawals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/withdrawals` | List withdrawals |
| POST | `/api/withdrawals` | Create withdrawal |
| GET | `/api/withdrawals/{id}` | Withdrawal details |
| POST | `/api/withdrawals/{id}/cancel` | Cancel withdrawal |

### Binary/Genealogy
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/binary/tree` | Binary tree data |
| GET | `/api/binary/genealogy` | Genealogy tree |
| GET | `/api/binary/stats` | Binary statistics |

### Commissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commissions` | Commission list |
| GET | `/api/commissions/summary` | Commission summary |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications/{id}/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |

### Daily Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/daily-tasks` | List tasks |
| POST | `/api/daily-tasks/{id}/complete` | Complete task |
| POST | `/api/daily-tasks/{id}/claim` | Claim reward |

## Database Schema

### Core Tables
- **users** - User accounts with profile, auth, and MLM data
- **packages** - Activation packages with pricing and commission rates
- **wallets** - Multi-balance wallet per user
- **wallet_transactions** - Immutable transaction ledger

### MLM Tables
- **binary_positions** - Binary tree positions (materialized path)
- **commissions** - All commission records
- **withdrawals** - Withdrawal requests and status tracking
- **carry_forward** - Binary carry forward balance

### Task Tables
- **daily_tasks** - Configurable tasks
- **task_completions** - User task completion records

### Security Tables
- **device_sessions** - User device/session tracking
- **audit_logs** - Immutable audit trail
- **personal_access_tokens** - Sanctum API tokens

## Getting Started

### Prerequisites
- PHP 8.4+
- Node.js 22+
- Composer 2.x
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Development

1. **Clone & Install Backend**
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

2. **Clone & Install Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Access**
- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Admin: http://localhost:8000/admin

### Docker Deployment

```bash
docker-compose up -d
```

This starts all services:
- PostgreSQL 16
- Redis 7
- Meilisearch
- Laravel backend
- Queue worker
- Scheduler
- Next.js frontend
- Nginx reverse proxy

## Docker Architecture

```
┌─────────────┐     ┌──────────────┐
│   Nginx     │────▶│   Frontend   │
│  (Reverse   │     │  (Next.js)   │
│   Proxy)    │────▶│   Backend    │
└─────────────┘     │  (Laravel)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Redis   │ │Meilisearch│
        └──────────┘ └──────────┘ └──────────┘

        ┌──────────┐ ┌──────────┐
        │  Queue   │ │Scheduler │
        │  Worker  │ │  (Cron)  │
        └──────────┘ └──────────┘
```

## Security Features

- **CSRF Protection** - Laravel built-in
- **SQL Injection Prevention** - Eloquent ORM
- **Rate Limiting** - API throttle middleware
- **Device Session Management** - Track & revoke sessions
- **Audit Logs** - Immutable action trail
- **Wallet Transaction Locking** - DB transaction isolation
- **Fraud Detection Hooks** - Pattern analysis ready
- **OTP Verification** - Time-based one-time passwords
- **2FA Support** - Two-factor authentication
- **Sanctum Token Auth** - Secure API authentication
- **CORS Configuration** - Controlled API access

## Performance Optimizations

- **SSR & Streaming** - Next.js server-side rendering
- **Redis Caching** - For queries and sessions
- **Queue Processing** - Background job processing
- **Database Indexing** - Optimized query performance
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Dynamic imports
- **Bundle Optimization** - Tree shaking
- **Brotli Compression** - Nginx configured
- **HTTP/3** - Cloudflare ready
- **CDN** - Cloudflare integration

## Production Deployment

### Coolify Deployment
1. Connect your Git repository to Coolify
2. Use the provided `docker-compose.yml`
3. Set environment variables in Coolify dashboard
4. Deploy with one click

### Manual Deployment
```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# Run migrations
docker-compose exec backend php artisan migrate --force

# Create admin user
docker-compose exec backend php artisan make:filament-user
```

### Environment Variables
Key variables to configure:
- `APP_URL` - Application URL
- `APP_DOMAIN` - Domain name
- `DB_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password
- `MEILISEARCH_KEY` - Search API key
- `SENTRY_DSN` - Error monitoring (optional)

## Scheduler (Cron Jobs)

The following scheduled tasks run automatically:
- `mlm:process-daily-income` - Daily at midnight
- `mlm:process-binary-bonus` - Every 15 minutes
- `mlm:cleanup-sessions` - Daily cleanup

## Monitoring

- **Sentry** - Error tracking & performance monitoring
- **Uptime Kuma** - Service uptime monitoring
- **Health Check** - `/health` endpoint for load balancers

## Roadmap

### Phase 1 (Current) ✅
- Authentication system
- User dashboard
- Binary joining system
- Wallet management
- Basic admin panel

### Phase 2 🔄
- Commission engine
- Withdrawal system
- Reports & analytics
- Genealogy visualization

### Phase 3
- Real-time notifications
- WebSocket integration
- Advanced analytics
- Performance optimization

### Phase 4
- AI fraud detection
- Predictive analytics
- Enterprise scaling
- Multi-language support

### Phase 5
- Mobile app (Flutter)
- Advanced MLM plans (Matrix, Unilevel)
- Payment gateway integration
- White-label solution

## License
Proprietary - All rights reserved.
