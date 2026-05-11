<?php
namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['app_name', 'MLM Pro', 'general', 'string'],
            ['app_description', 'Enterprise MLM Platform', 'general', 'string'],
            ['app_url', 'http://127.0.0.1:8000', 'general', 'string'],
            ['support_email', 'support@mlmpro.com', 'general', 'string'],
            ['support_phone', '+1-800-MLM-PRO', 'general', 'string'],

            // Branding
            ['logo_light', '/images/logo-light.png', 'branding', 'string'],
            ['logo_dark', '/images/logo-dark.png', 'branding', 'string'],
            ['favicon', '/favicon.ico', 'branding', 'string'],
            ['brand_color', '#2563eb', 'branding', 'string'],

            // Landing
            ['hero_title', 'Build Your MLM Empire', 'landing', 'string'],
            ['hero_subtitle', 'Empower your network with cutting-edge tools', 'landing', 'string'],
            ['hero_cta_text', 'Get Started', 'landing', 'string'],
            ['hero_cta_url', '/register', 'landing', 'string'],
            ['features_visible', 'true', 'landing', 'boolean'],

            // Theme
            ['primary_color', '#2563eb', 'theme', 'string'],
            ['secondary_color', '#7c3aed', 'theme', 'string'],
            ['dark_mode_enabled', 'true', 'theme', 'boolean'],
            ['font_family', 'Inter', 'theme', 'string'],
            ['border_radius', '0.75', 'theme', 'number'],

            // Features
            ['registration_enabled', 'true', 'features', 'boolean'],
            ['binary_enabled', 'true', 'features', 'boolean'],
            ['referral_enabled', 'true', 'features', 'boolean'],
            ['daily_tasks_enabled', 'true', 'features', 'boolean'],
            ['withdrawal_enabled', 'true', 'features', 'boolean'],

            // Dashboard
            ['show_income_chart', 'true', 'dashboard', 'boolean'],
            ['show_wallet_overview', 'true', 'dashboard', 'boolean'],
            ['show_recent_transactions', 'true', 'dashboard', 'boolean'],
            ['show_team_tree', 'true', 'dashboard', 'boolean'],
            ['dashboard_subtitle', "Here's what's happening with your account today.", 'dashboard', 'string'],
            ['dashboard_stat_balance_label', 'Total Balance', 'dashboard', 'string'],
            ['dashboard_stat_income_label', 'Total Income', 'dashboard', 'string'],
            ['dashboard_stat_team_label', 'Team Members', 'dashboard', 'string'],
            ['dashboard_stat_bonus_label', 'Bonuses', 'dashboard', 'string'],
            ['dashboard_trend_label', 'vs last 30 days', 'dashboard', 'string'],
            ['dashboard_chart_title', 'Income Overview', 'dashboard', 'string'],
            ['dashboard_chart_subtitle', 'Daily income for the last 30 days', 'dashboard', 'string'],
            ['dashboard_chart_total_label', 'Total Income (30d)', 'dashboard', 'string'],
            ['dashboard_chart_avg_label', 'Daily Average', 'dashboard', 'string'],
            ['dashboard_wallet_total_label', 'Total Balance', 'dashboard', 'string'],
            ['dashboard_wallet_available_label', 'Available for withdrawal', 'dashboard', 'string'],
            ['dashboard_wallet_income_label', 'Income Balance', 'dashboard', 'string'],
            ['dashboard_wallet_bonus_label', 'Bonus Balance', 'dashboard', 'string'],
            ['dashboard_wallet_withdrawable_label', 'Withdrawable', 'dashboard', 'string'],
            ['dashboard_team_title', 'Team Overview', 'dashboard', 'string'],
            ['dashboard_team_total_label', 'Total', 'dashboard', 'string'],
            ['dashboard_team_active_label', 'Active', 'dashboard', 'string'],
            ['dashboard_team_inactive_label', 'Inactive', 'dashboard', 'string'],
            ['dashboard_team_new_label', 'New', 'dashboard', 'string'],
            ['dashboard_team_active_rate_label', 'Active Rate', 'dashboard', 'string'],
            ['dashboard_team_binary_legs_label', 'Binary Legs', 'dashboard', 'string'],
            ['dashboard_team_left_label', 'Left (A)', 'dashboard', 'string'],
            ['dashboard_team_right_label', 'Right (B)', 'dashboard', 'string'],
            ['dashboard_transactions_title', 'Recent Transactions', 'dashboard', 'string'],
            ['dashboard_transactions_empty', 'No transactions yet.', 'dashboard', 'string'],
            ['dashboard_actions_title', 'Quick Actions', 'dashboard', 'string'],
            ['dashboard_welcome_prefix', 'Welcome back,', 'dashboard', 'string'],
            ['dashboard_error_text', 'Failed to load dashboard data.', 'dashboard', 'string'],
            ['dashboard_reload_text', 'Reload', 'dashboard', 'string'],
            ['dashboard_wallet_deposit_label', 'Deposit', 'dashboard', 'string'],
            ['dashboard_wallet_withdraw_label', 'Withdraw', 'dashboard', 'string'],
            ['dashboard_wallet_transfer_label', 'Transfer', 'dashboard', 'string'],
            ['dashboard_chart_empty', 'No income data yet', 'dashboard', 'string'],
            ['dashboard_chart_na_label', 'N/A', 'dashboard', 'string'],
            ['dashboard_action_deposit_label', 'Deposit Funds', 'dashboard', 'string'],
            ['dashboard_action_withdraw_label', 'Withdraw', 'dashboard', 'string'],
            ['dashboard_action_view_tree_label', 'View Tree', 'dashboard', 'string'],
            ['dashboard_action_team_label', 'My Team', 'dashboard', 'string'],
            ['dashboard_action_tasks_label', 'Daily Tasks', 'dashboard', 'string'],
            ['dashboard_action_referral_label', 'Referral Link', 'dashboard', 'string'],
            ['dashboard_referral_copied_text', 'Referral link copied!', 'dashboard', 'string'],

            // Announcements
            ['announcement_enabled', 'false', 'announcements', 'boolean'],
            ['announcement_text', '', 'announcements', 'string'],
            ['announcement_type', 'info', 'announcements', 'string'],

            // Social
            ['facebook_url', 'https://facebook.com/mlmpro', 'social', 'string'],
            ['twitter_url', 'https://twitter.com/mlmpro', 'social', 'string'],
            ['telegram_url', 'https://t.me/mlmpro', 'social', 'string'],
            ['whatsapp_number', '', 'social', 'string'],

            // CMS
            ['footer_text', '© 2026 MLM Pro. All rights reserved.', 'cms', 'string'],
            ['terms_of_service', '', 'cms', 'string'],
            ['privacy_policy', '', 'cms', 'string'],

            // SEO
            ['meta_title', 'MLM Pro - Enterprise MLM Platform', 'seo', 'string'],
            ['meta_description', 'Build and manage your MLM network', 'seo', 'string'],
            ['meta_keywords', 'mlm, network marketing, binary', 'seo', 'json'],
        ];

        $publicKeys = [
            'app_name', 'app_description', 'support_email', 'support_phone',
            'logo_light', 'logo_dark', 'favicon', 'brand_color',
            'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_cta_url', 'features_visible',
            'primary_color', 'secondary_color', 'dark_mode_enabled', 'font_family', 'border_radius',
            'registration_enabled', 'binary_enabled', 'referral_enabled', 'daily_tasks_enabled', 'withdrawal_enabled',
            'show_income_chart', 'show_wallet_overview', 'show_recent_transactions', 'show_team_tree',
            'dashboard_subtitle', 'dashboard_stat_balance_label', 'dashboard_stat_income_label',
            'dashboard_stat_team_label', 'dashboard_stat_bonus_label', 'dashboard_trend_label',
            'dashboard_chart_title', 'dashboard_chart_subtitle', 'dashboard_chart_total_label',
            'dashboard_chart_avg_label', 'dashboard_wallet_total_label', 'dashboard_wallet_available_label',
            'dashboard_wallet_income_label', 'dashboard_wallet_bonus_label', 'dashboard_wallet_withdrawable_label',
            'dashboard_team_title', 'dashboard_team_total_label', 'dashboard_team_active_label',
            'dashboard_team_inactive_label', 'dashboard_team_new_label', 'dashboard_team_active_rate_label',
            'dashboard_team_binary_legs_label', 'dashboard_team_left_label', 'dashboard_team_right_label',
            'dashboard_transactions_title', 'dashboard_transactions_empty', 'dashboard_actions_title',
            'dashboard_welcome_prefix', 'dashboard_error_text', 'dashboard_reload_text',
            'dashboard_wallet_deposit_label', 'dashboard_wallet_withdraw_label', 'dashboard_wallet_transfer_label',
            'dashboard_chart_empty', 'dashboard_chart_na_label',
            'dashboard_action_deposit_label', 'dashboard_action_withdraw_label',
            'dashboard_action_view_tree_label', 'dashboard_action_team_label',
            'dashboard_action_tasks_label', 'dashboard_action_referral_label',
            'dashboard_referral_copied_text',
            'announcement_enabled', 'announcement_text', 'announcement_type',
            'facebook_url', 'twitter_url', 'telegram_url', 'whatsapp_number',
            'footer_text', 'terms_of_service', 'privacy_policy',
            'meta_title', 'meta_description', 'meta_keywords',
        ];

        foreach ($settings as [$key, $value, $group, $type]) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'group' => $group,
                    'type' => $type,
                    'is_public' => in_array($key, $publicKeys),
                ]
            );
        }
    }
}
