<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditResource;
use App\Models\AuditModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Response;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'model' => ['required', 'string'],
            'id' => ['required', 'uuid'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $modelClass = config("audit.models.{$validated['model']}");

        if(!$modelClass) {
            return response()->json([], Response::HTTP_NOT_FOUND);
        }

        $entityId = $validated['id'];
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 10;
        $search = isset($validated['search']) ? trim($validated['search']) : null;

        $paginator = DB::transaction(function () use ($modelClass, $entityId, $page, $perPage, $search) {
            $query = AuditModel::query()
                ->where('auditable_type', $modelClass)
                ->where('auditable_id', $entityId)
                ->with('user')
                ->orderBy('created_at', 'desc');

            if ($search) {
                $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('email', 'LIKE', "%{$search}%");
                });
            }

            return $query->paginate($perPage, ['*'], 'page', $page);
        });

        return AuditResource::collection($paginator);
    }
}
