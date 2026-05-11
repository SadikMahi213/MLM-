<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminController extends Controller
{
    public function impersonate(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $token = $user->createToken('impersonation', ['*'], now()->addMinutes(5))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('wallet', 'package'),
            'message' => "Now logged in as {$user->name}",
            'expires_in' => 5,
        ]);
    }
}
