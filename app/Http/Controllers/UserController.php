<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{

    function me(Request $request)
    {
        $user = $request->user();

        if ($user) {
            return $user;
        }

        return response()->json(['error' => 'not auth'], 401);
    }
}