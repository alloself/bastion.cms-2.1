<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class SiteController extends Controller
{
    public function admin()
    {
        return view('admin::admin');
    }
}
