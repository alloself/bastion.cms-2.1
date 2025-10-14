<?php

return [

    'paths' => [
        resource_path('site/views'),
        resource_path('admin/views'),
    ],

    'compiled' => env('VIEW_COMPILED_PATH', realpath(storage_path('framework/views'))),
];


