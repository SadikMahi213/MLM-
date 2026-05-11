<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Commission::where('user_id', $request->user()->id);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $commissions = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($commissions);
    }

    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        $summary = Commission::where('user_id', $userId)
            ->where('status', 'credited')
            ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('type')
            ->get();

        $total = Commission::where('user_id', $userId)
            ->where('status', 'credited')
            ->sum('amount');

        return response()->json([
            'total' => $total,
            'by_type' => $summary,
        ]);
    }
}
