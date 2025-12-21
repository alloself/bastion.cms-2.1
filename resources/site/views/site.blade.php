<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bastion.CMS</title>
    {{ Vite::useHotFile(storage_path('framework/vite.site.hot'))->useBuildDirectory('build/site')->withEntryPoints(['resources/site/css/index.css', 'resources/site/ts/index.ts']) }}
</head>

<body>
    site
</body>

</html>
