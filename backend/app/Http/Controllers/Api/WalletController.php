<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\TransactionResource;
use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    public function index(Request $request)
    {
        $wallet = $request->user()->wallet;

        if (!$wallet) {
            return response()->json(['message' => 'No wallet found'], 404);
        }

        return new WalletResource($wallet);
    }

    public function transactions(Request $request)
    {
        $filters = $request->only(['type', 'status', 'from_date', 'to_date', 'per_page']);
        $transactions = $this->walletService->getTransactions($request->user(), $filters);

        return TransactionResource::collection($transactions);
    }

    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
        ]);

        $transaction = $this->walletService->deposit(
            $request->user(),
            $validated['amount'],
            [
                'description' => 'Deposit via ' . $validated['payment_method'],
                'metadata' => [
                    'payment_method' => $validated['payment_method'],
                    'payment_transaction_id' => $validated['transaction_id'] ?? null,
                ],
            ]
        );

        return response()->json([
            'message' => 'Deposit successful',
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    public function history(Request $request)
    {
        $summary = $this->walletService->getIncomeSummary($request->user());

        return response()->json($summary);
    }
}
