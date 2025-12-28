<?php

namespace App\Http\Controllers;

use App\Models\Page;

class PageController extends CRUDController
{
    public function model(): string
    {
        return Page::class;
    }
}
