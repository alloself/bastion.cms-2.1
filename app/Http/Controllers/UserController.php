<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user) {
            return new UserResource($user);
        }

        return response()->json(['error' => 'not auth'], 401);
    }
}