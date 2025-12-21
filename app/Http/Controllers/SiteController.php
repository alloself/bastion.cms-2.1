<?php

namespace App\Http\Controllers;

class SiteController extends Controller
{

    public function admin()
    {
        return view('admin::admin');
    }

    public function site()
    {
        return view('site::site');
    }
}