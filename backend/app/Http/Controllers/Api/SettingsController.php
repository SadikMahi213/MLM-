<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(SettingsService $settings)
    {
        return response()->json([
            'data' => $settings->getPublic(),
        ]);
    }

    public function flush(Request $request, SettingsService $settings)
    {
        $settings->flush();

        return response()->json([
            'message' => 'Settings cache flushed successfully',
            'data' => $settings->getPublic(),
        ]);
    }
}
