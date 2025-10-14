<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Admin</title>
        {{
            Vite::useHotFile(storage_path('framework/vite.admin.hot'))
                ->useBuildDirectory('build/admin')
                ->withEntryPoints(['resources/admin/css/app.scss', 'resources/admin/js/main.ts'])
        }}
    </head>
    <body>
        <div id="admin-app"></div>
    </body>
    
</html>

