<?php

namespace App\Http\Controllers;

use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\Pivot\Fileable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FileController extends CRUDController
{
    public function model(): string
    {
        return File::class;
    }

    protected function resource(): string
    {
        return FileResource::class;
    }

    protected function validationRules(): array
    {
        $rules = [
            'name' => ['nullable', 'string', 'max:255'],
            'extension' => ['nullable', 'string', 'max:50'],
        ];

        if (request()->isMethod('POST')) {
            $rules['file'] = ['required', 'file'];
        } else {
            $rules['file'] = ['nullable', 'file'];
        }

        return $rules;
    }

    protected function validationMessages(): array
    {
        return [
            'file.required' => 'Файл обязателен для загрузки.',
            'file.file' => 'Необходимо загрузить файл.',
        ];
    }

    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model' => ['required', 'string', Rule::in(array_keys(config('fileable.models', [])))],
            'model_id' => ['required', 'uuid'],
            'type' => ['required', 'string', 'in:image,video,file'],
            'key' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'file_ids' => ['nullable', 'array'],
            'file_ids.*' => ['uuid', 'exists:files,id'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file'],
        ], [
            'model.required' => 'Ключ модели обязателен.',
            'model.in' => 'Модель не найдена.',
            'model_id.required' => 'ID сущности обязателен.',
            'model_id.uuid' => 'ID сущности должен быть валидным UUID.',
            'type.required' => 'Тип файла обязателен.',
            'type.in' => 'Тип должен быть: image, video или file.',
            'file_ids.*.uuid' => 'ID файла должен быть валидным UUID.',
            'file_ids.*.exists' => 'Файл не найден.',
        ]);

        $modelClass = config("fileable.models.{$validated['model']}");
        $entity = $modelClass::find($validated['model_id']);

        if (!$entity) {
            return response()->json(['message' => 'Сущность не найдена.'], Response::HTTP_NOT_FOUND);
        }

        $fileIds = $validated['file_ids'] ?? [];
        $uploadedFiles = $request->file('files', []);

        if (count($fileIds) === 0 && count($uploadedFiles) === 0) {
            throw ValidationException::withMessages([
                'file_ids' => ['Необходимо указать file_ids или загрузить files.'],
            ]);
        }

        $entity = DB::transaction(function () use ($entity, $fileIds, $uploadedFiles, $validated) {
            $relation = $this->getRelationByType($entity, $validated['type']);
            $type = $validated['type'];

            foreach ($uploadedFiles as $uploadedFile) {
                $file = File::createEntity(['file' => $uploadedFile]);
                $fileIds[] = $file->id;
            }

            foreach ($fileIds as $fileId) {
                $relation->attach($fileId, [
                    'type' => $type,
                    'key' => $validated['key'],
                    'order' => $validated['order'],
                ]);
            }

            $entity->load(['images', 'files', 'videos']);

            return $entity;
        });

        return response()->json($entity);
    }

    public function updateRelation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model' => ['required', 'string', Rule::in(array_keys(config('fileable.models', [])))],
            'model_id' => ['required', 'uuid'],
            'file_id' => ['required', 'uuid', 'exists:files,id'],
            'key' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ], [
            'model.required' => 'Ключ модели обязателен.',
            'model.in' => 'Модель не найдена.',
            'model_id.required' => 'ID сущности обязателен.',
            'file_id.required' => 'ID файла обязателен.',
            'file_id.exists' => 'Файл не найден.',
        ]);

        $modelClass = config("fileable.models.{$validated['model']}");
        $fileable = Fileable::query()
            ->where('fileable_id', $validated['model_id'])
            ->where('fileable_type', $modelClass)
            ->where('file_id', $validated['file_id'])
            ->first();

        if (!$fileable) {
            return response()->json(['message' => 'Связь не найдена.'], Response::HTTP_NOT_FOUND);
        }

        $updateData = [];
        if (array_key_exists('key', $validated)) {
            $updateData['key'] = $validated['key'];
        }
        if (array_key_exists('order', $validated)) {
            $updateData['order'] = $validated['order'];
        }

        if (count($updateData) > 0) {
            $fileable->update($updateData);
        }

        return response()->json($fileable->fresh());
    }

    public function detach(Request $request): Response|JsonResponse
    {
        $validated = $request->validate([
            'model' => ['required', 'string', Rule::in(array_keys(config('fileable.models', [])))],
            'model_id' => ['required', 'uuid'],
            'file_ids' => ['required', 'array'],
            'file_ids.*' => ['uuid', 'exists:files,id'],
        ], [
            'model.required' => 'Ключ модели обязателен.',
            'model.in' => 'Модель не найдена.',
            'model_id.required' => 'ID сущности обязателен.',
            'file_ids.required' => 'Список ID файлов обязателен.',
            'file_ids.*.exists' => 'Файл не найден.',
        ]);

        $modelClass = config("fileable.models.{$validated['model']}");

        DB::transaction(function () use ($validated, $modelClass) {
            Fileable::query()
                ->where('fileable_id', $validated['model_id'])
                ->where('fileable_type', $modelClass)
                ->whereIn('file_id', $validated['file_ids'])
                ->delete();

            foreach ($validated['file_ids'] as $fileId) {
                $file = File::find($fileId);
                if ($file !== null && $file->fileables()->count() === 0) {
                    $file->deleteEntity();
                }
            }
        });

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    private function getRelationByType(object $entity, string $type)
    {
        $relationMap = [
            'image' => 'images',
            'video' => 'videos',
            'file' => 'files',
        ];

        $relationName = $relationMap[$type];

        return $entity->{$relationName}();
    }
}
