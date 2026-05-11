<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\TransactionResource;
use App\Models\WalletTransaction;
use App\Models\Commission;
use App\Models\User;
use App\Models\BinaryPosition;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wallet = $user->wallet;

        $myReferrals = User::where('sponsor_id', $user->id);
        $totalTeam = (clone $myReferrals)->count();
        $activeTeam = (clone $myReferrals)->where('is_active', true)->count();
        $inactiveTeam = max(0, $totalTeam - $activeTeam);
        $newTeamThisMonth = (clone $myReferrals)->where('created_at', '>=', now()->startOfMonth())->count();

        $binary = BinaryPosition::where('user_id', $user->id)->first();
        $leftLeg = $binary ? $binary->total_left_members : 0;
        $rightLeg = $binary ? $binary->total_right_members : 0;

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        $totalBonuses = Commission::where('user_id', $user->id)->where('status', 'credited')->sum('amount');

        // --- Chart data (30 days) ---
        $chartStart = now()->subDays(29)->startOfDay();
        $incomeTxns = WalletTransaction::where('user_id', $user->id)
            ->where('amount', '>', 0)
            ->where('created_at', '>=', $chartStart)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date');

        $incomeChart = collect();
        $chartIncomeSum = 0;
        for ($i = 29; $i >= 0; $i--) {
            $day = now()->subDays($i)->format('Y-m-d');
            $val = (float) ($incomeTxns[$day] ?? 0);
            $chartIncomeSum += $val;
            $incomeChart->push([
                'date' => now()->subDays($i)->format('M d'),
                'income' => $val,
            ]);
        }

        // --- Trends (compare last 30d vs previous 30d) ---
        $prevStart = now()->subDays(59)->startOfDay();
        $prevEnd = now()->subDays(30)->startOfDay();

        $currentIncome = WalletTransaction::where('user_id', $user->id)
            ->where('amount', '>', 0)->where('created_at', '>=', $chartStart)->sum('amount');
        $prevIncome = WalletTransaction::where('user_id', $user->id)
            ->where('amount', '>', 0)->whereBetween('created_at', [$prevStart, $prevEnd])->sum('amount');
        $incomeTrend = $prevIncome > 0 ? round((($currentIncome - $prevIncome) / $prevIncome) * 100, 1) : 0;

        $prevTeamCount = User::where('sponsor_id', $user->id)
            ->where('created_at', '<', $chartStart)->count();
        $teamTrend = $prevTeamCount > 0 ? round((($totalTeam - $prevTeamCount) / $prevTeamCount) * 100, 1) : 0;

        $prevBonus = Commission::where('user_id', $user->id)->where('status', 'credited')
            ->where('created_at', '<', $chartStart)->sum('amount');
        $bonusTrend = $prevBonus > 0 ? round((($totalBonuses - $prevBonus) / $prevBonus) * 100, 1) : 0;

        $unreadNotifications = $user->notifications()->whereNull('read_at')->take(5)->get();

        return response()->json([
            'wallet' => $wallet ? new WalletResource($wallet) : null,
            'total_balance' => $wallet ? (float) $wallet->balance : 0,
            'total_income' => $wallet ? (float) $wallet->total_income : 0,
            'total_bonuses' => $totalBonuses,
            'total_team' => $totalTeam,
            'active_team' => $activeTeam,
            'inactive_team' => $inactiveTeam,
            'new_team_this_month' => $newTeamThisMonth,
            'left_leg' => (int) $leftLeg,
            'right_leg' => (int) $rightLeg,
            'pending_withdrawals' => $user->withdrawals()->where('status', 'pending')->count(),
            'recent_transactions' => TransactionResource::collection($recentTransactions),
            'income_chart' => $incomeChart,
            'chart_total_income' => round($chartIncomeSum, 2),
            'chart_daily_avg' => $chartIncomeSum > 0 ? round($chartIncomeSum / 30, 2) : 0,
            'income_trend' => $incomeTrend,
            'team_trend' => $teamTrend,
            'bonus_trend' => $bonusTrend,
            'unread_notifications' => $unreadNotifications,
        ]);
    }
}
