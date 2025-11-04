<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function model(): string
    {
        return User::class;
    }

    function me(Request $request)
    {
        $user = $request->user();

        if ($user) {
            return $user;
        }

        return response()->json(['error' => 'not auth'], 401);
    }
}
