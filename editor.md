### Задача: `BCodeEditor` (Monaco Editor + Laravel Blade через VSCode extension)

### Контекст
Компонент используется как поле формы в админке (см. `resources/admin/ts/shared/modules/forms/template.ts`, поле `value`).

### Цель
Реализовать компонент `resources/admin/ts/shared/components/BCodeEditor.vue`, который предоставляет полноценный Monaco Editor для редактирования шаблонов Laravel Blade с подключением **VSCode-расширения Blade** через `@codingame/monaco-vscode-api`.

### Объём (обязательно)
- **Monaco Editor** внутри Vue 3 компонента.
- **Blade поддержка через VSCode extension**:
  - подсветка синтаксиса (TextMate grammar)
  - snippets/автодополнение из расширения (минимум: директивы `@if`, `@foreach`, `@section`, `@extends`, `@include`, Blade-комментарии `{{-- --}}`, echo `{{ }}` / `{!! !!}`)
  - language configuration (скобки/кавычки/auto-closing, если доступно в расширении)
- **Интеграция с `BSmartForm`**:
  - принимает `model-value` и эмитит `update:modelValue` (строка)
  - поддерживает `readonly`, `loading`, `error-messages`, `label`, `name`, `height`, `options` (как в конфиге формы)

### Не входит в задачу (явно)
- LSP/диагностика Blade/PHP, форматирование кода, линтинг шаблонов.
- HTTP/Colada/работа с сетью внутри компонента.

### Технические требования
- **Vue 3 + TypeScript** (`<script setup lang="ts">`).
- **Без `any`**, **без приведения типов через `as`**, **строгое сравнение** (`===`/`!==`), **без `continue`**, **без пустых `catch`**.
- Компонент UI-уровня: бизнес-логика и инициализация интеграции Monaco/VSCode — вынести в `resources/admin/ts/shared/monaco/` (однократная инициализация, singleton).
- Использовать пакеты (уже есть в `package.json`):
  - `monaco-editor`
  - `@codingame/monaco-vscode-api`
  - `@codingame/monaco-vscode-extensions-service-override`
  - `@codingame/monaco-vscode-languages-service-override`
  - `@codingame/monaco-vscode-textmate-service-override`
  - `@codingame/monaco-vscode-theme-service-override`
  - `@codingame/monaco-vscode-theme-defaults-default-extension`
- Источники для Blade:
  - грамматика: `resources/admin/ts/shared/monaco/syntaxes/blade.tmLanguage.json` (источник: `https://raw.githubusercontent.com/onecentlin/laravel-blade-snippets-vscode/master/syntaxes/blade.tmLanguage.json`)
  - репозиторий расширения (ориентир для структуры/manifest/snippets): `https://github.com/amirmarmul/laravel-blade-vscode/tree/master`
- Vite: обеспечить корректную загрузку workers Monaco (editor worker минимум) без ошибок в консоли.
- Тема: по умолчанию использовать тёмную тему, согласованную с админкой (Vuetify defaultTheme = `dark`).

### API компонента (обязательно)
Props:
- `modelValue: string`
- `name?: string`
- `label?: string`
- `height?: string | number` (поддержать значения типа `"520px"`)
- `options?: Partial<monaco.editor.IStandaloneEditorConstructionOptions>` (например, `wordWrap`, `tabSize`)
- `readonly?: boolean`
- `loading?: boolean`
- `errorMessages?: string | string[]`
- `language?: string` (по умолчанию Blade)

Emits:
- `update:modelValue(value: string)`

### UX требования
- Визуально вести себя как поле ввода Vuetify: label + ошибки (`error-messages`).
- Высота управляется пропсом `height`, ширина 100%.
- При `readonly=true` запретить редактирование.
- При ошибке инициализации Monaco/extension — показать понятный fallback (например, `v-textarea`) и залогировать ошибку (без пустого `catch`).

### Критерии приёмки
- В форме шаблона поле `value` рендерит редактор и работает двустороннее связывание.
- Подсветка Blade работает на примерах: `@if`, `@foreach`, `{{-- comment --}}`, `{{ $var }}`, `{!! $html !!}`.
- Snippets из расширения появляются в подсказках (минимум для базовых директив).
- `readonly`, `height`, `options.wordWrap`, `options.tabSize`, `error-messages` применяются.
- Нет ошибок в консоли, нет утечек (редактор корректно dispose на unmount).

### Тест-план (ручной)
- Запустить `npm run dev:admin`.
- Открыть экран шаблонов → создание/редактирование.
- Проверить критерии приёмки выше.
- Запустить `npm run type-check:admin` (должно проходить).
