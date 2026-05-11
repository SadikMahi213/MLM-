<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\WithdrawalRequest;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;

class WithdrawalController extends Controller
{
    public function __construct(private WithdrawalService $withdrawalService) {}

    public function index(Request $request)
    {
        $withdrawals = Withdrawal::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($withdrawals);
    }

    public function store(WithdrawalRequest $request)
    {
        try {
            $withdrawal = $this->withdrawalService->createWithdrawal(
                $request->user(),
                $request->amount,
                $request->payment_method,
                $request->only(['account_number', 'account_holder'])
            );

            return response()->json([
                'message' => 'Withdrawal request created successfully',
                'withdrawal' => $withdrawal,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\App\Exceptions\InsufficientBalanceException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\App\Exceptions\FraudDetectionException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    public function show($id)
    {
        $withdrawal = Withdrawal::where('id', $id)
            ->where('user_id', request()->user()->id)
            ->firstOrFail();

        return response()->json($withdrawal);
    }

    public function cancel($id)
    {
        $withdrawal = Withdrawal::where('id', $id)
            ->where('user_id', request()->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $wallet = request()->user()->wallet;
        if ($wallet) {
            $wallet->balance += $withdrawal->amount;
            $wallet->withdrawable_balance += $withdrawal->amount;
            $wallet->save();
        }

        $withdrawal->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Withdrawal cancelled successfully']);
    }
}
