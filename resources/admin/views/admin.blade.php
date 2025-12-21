<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="admin-html">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bastion.CMS</title>
    {{ Vite::useHotFile(storage_path('framework/vite.admin.hot'))->useBuildDirectory('build/admin')->withEntryPoints(['resources/admin/scss/index.scss', 'resources/admin/ts/index.ts']) }}
</head>

<body>
    <div id="admin-app"></div>
</body>

</html>
