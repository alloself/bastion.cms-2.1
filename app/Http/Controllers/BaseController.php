<?php

namespace App\Http\Controllers;

use Illuminate\Http\Resources\Json\JsonResource;

abstract class BaseController extends Controller
{
    abstract public function model(): string;

    protected function allowedRelations(): array
    {
        return [];
    }

    protected function validationRules(): array
    {
        return [];
    }

    protected function resource(): string
    {
        return JsonResource::class;
    }
}
