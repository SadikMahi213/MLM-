<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BinaryService;
use App\Models\BinaryPosition;
use App\Models\User;
use Illuminate\Http\Request;

class BinaryController extends Controller
{
    public function __construct(private BinaryService $binaryService) {}

    public function index(Request $request)
    {
        $depth = (int) $request->get('depth', 5);
        $tree = $this->binaryService->getBinaryTree($request->user(), $depth);

        return response()->json(['tree' => $tree]);
    }

    public function genealogy(Request $request)
    {
        $maxDepth = (int) $request->get('max_depth', 10);
        $genealogy = $this->binaryService->getGenealogy($request->user(), $maxDepth);

        return response()->json(['genealogy' => $genealogy]);
    }

    public function stats(Request $request)
    {
        $position = $request->user()->binaryPosition;

        if (!$position) {
            return response()->json(['message' => 'No binary position found'], 404);
        }

        return response()->json([
            'level' => $position->level,
            'left_bv' => $position->left_bv,
            'right_bv' => $position->right_bv,
            'carry_forward_left' => $position->carry_forward_left,
            'carry_forward_right' => $position->carry_forward_right,
            'total_left_members' => $position->total_left_members,
            'total_right_members' => $position->total_right_members,
            'active_left_members' => $position->active_left_members,
            'active_right_members' => $position->active_right_members,
            'total_team' => $position->total_left_members + $position->total_right_members,
            'active_team' => $position->active_left_members + $position->active_right_members,
        ]);
    }
}
