<?php

namespace App\Http\Controllers;

use App\Models\Template;

class TemplateController extends CRUDController
{
    public function model(): string
    {
        return Template::class;
    }
}
