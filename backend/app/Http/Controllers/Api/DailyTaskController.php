<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyTask;
use App\Models\TaskCompletion;
use App\Services\CommissionService;
use Illuminate\Http\Request;

class DailyTaskController extends Controller
{
    public function __construct(private CommissionService $commissionService) {}

    public function index(Request $request)
    {
        $tasks = DailyTask::where('is_active', true)->get();
        $userId = $request->user()->id;

        $tasks->each(function ($task) use ($userId) {
            $task->completed_today = TaskCompletion::where('user_id', $userId)
                ->where('daily_task_id', $task->id)
                ->where('completed_date', today())
                ->exists();

            $task->reward_claimed = TaskCompletion::where('user_id', $userId)
                ->where('daily_task_id', $task->id)
                ->where('completed_date', today())
                ->where('reward_claimed', true)
                ->exists();
        });

        return response()->json($tasks);
    }

    public function complete($id, Request $request)
    {
        $task = DailyTask::where('id', $id)->where('is_active', true)->firstOrFail();

        $existing = TaskCompletion::where('user_id', $request->user()->id)
            ->where('daily_task_id', $task->id)
            ->where('completed_date', today())
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Task already completed today'], 422);
        }

        $completion = TaskCompletion::create([
            'user_id' => $request->user()->id,
            'daily_task_id' => $task->id,
            'completed_date' => today(),
        ]);

        return response()->json([
            'message' => 'Task completed successfully',
            'completion' => $completion,
        ]);
    }

    public function claimReward($id, Request $request)
    {
        $task = DailyTask::findOrFail($id);

        $completion = TaskCompletion::where('user_id', $request->user()->id)
            ->where('daily_task_id', $task->id)
            ->where('completed_date', today())
            ->where('reward_claimed', false)
            ->firstOrFail();

        $this->commissionService->awardDailyTaskReward($request->user(), $task);

        $completion->update([
            'reward_claimed' => true,
            'claimed_at' => now(),
        ]);

        return response()->json(['message' => 'Reward claimed successfully']);
    }
}
