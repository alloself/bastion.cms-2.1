<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user !== null) {
            return new UserResource($user);
        }

        return response()->json(['error' => 'not auth'], 401);
    }
}
