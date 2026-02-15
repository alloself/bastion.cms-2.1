<?php

namespace App\Http\Controllers\Admin;

use App\Models\Attribute; 
use App\Http\Resources\AttributeResource;


class AttributeController extends CRUDController
{
    public function model(): string
    {
        return Attribute::class;
    }

    protected function resource(): string
    {
        return AttributeResource::class;
    }
}
