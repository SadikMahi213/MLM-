<?php
return [
    'binary' => [
        'matching_percentage' => env('MLM_BINARY_MATCHING_PERCENT', 10),
        'max_depth' => env('MLM_BINARY_MAX_DEPTH', 20),
        'carry_forward_enabled' => env('MLM_CARRY_FORWARD_ENABLED', true),
        'flush_daily' => env('MLM_BINARY_FLUSH_DAILY', false),
    ],
    'commission' => [
        'referral' => [
            'default_percentage' => env('MLM_REFERRAL_PERCENT', 10),
        ],
        'generation' => [
            'level_1' => env('MLM_GEN_LEVEL_1', 5),
            'level_2' => env('MLM_GEN_LEVEL_2', 3),
            'level_3' => env('MLM_GEN_LEVEL_3', 1),
        ],
    ],
    'withdrawal' => [
        'minimum_amount' => env('MLM_MIN_WITHDRAWAL', 10),
        'maximum_amount' => env('MLM_MAX_WITHDRAWAL', 10000),
        'fee_percentage' => env('MLM_WITHDRAWAL_FEE', 2),
        'daily_limit' => env('MLM_DAILY_WITHDRAWAL_LIMIT', 5000),
        'cooldown_hours' => env('MLM_WITHDRAWAL_COOLDOWN', 24),
    ],
    'security' => [
        'max_login_attempts' => env('MLM_MAX_LOGIN_ATTEMPTS', 5),
        'lockout_duration' => env('MLM_LOCKOUT_DURATION', 15),
        'otp_expiry' => env('MLM_OTP_EXPIRY', 5),
    ],
    'registration' => [
        'require_sponsor' => env('MLM_REQUIRE_SPONSOR', true),
        'default_position' => env('MLM_DEFAULT_POSITION', 'auto'),
    ],
];
