# Create Page

Скилл создания страницы (page) в проекте. Страницы — верхний уровень FSD, соответствуют маршрутам.

## Когда использовать

- Добавление нового маршрута / страницы.
- Создание вложенной страницы.

## Входные данные

1. **Имя страницы**: PascalCase (пример: `TaskDetails`, `UserSettings`).
2. **Маршрут**: URL-путь (пример: `/tasks/:id`, `/settings`).
3. **Layout**: какой layout использовать.
4. **Компоненты**: какие widgets / компоненты будут на странице.

## Шаги

### 1. Создать папку страницы

Путь: `src/pages/[pageName]/`

```
src/pages/taskDetails/
├── TaskDetailsPage.vue
├── types.ts
└── index.ts
```

### 2. Создать `types.ts`

```ts
export interface ITaskDetailsPageProps {
  taskId: string;
}
```

### 3. Создать `[PageName]Page.vue`

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

defineOptions({ name: 'TaskDetailsPage' });

const route = useRoute();
const { t } = useI18n();

// Извлечение параметров маршрута
const taskId = computed(() => String(route.params.id));
</script>

<template>
  <div class="task-details-page">
    <!-- Композиция widgets и components -->
  </div>
</template>

<style lang="scss" scoped>
.task-details-page {
  //
}
</style>
```

Правила:

- Суффикс `Page` в имени компонента: `TaskDetailsPage`.
- Страница НЕ содержит бизнес-логику — только композиция widgets/компонентов.
- Данные получаются через hooks (`useQuery`, `useMutation`).

### 4. Создать `index.ts`

```ts
export { default as TaskDetailsPage } from './TaskDetailsPage.vue';
export * from './types';
```

### 5. Добавить маршрут в router

Файл: `src/router/` (соответствующий модуль маршрутов).

```ts
{
  path: '/tasks/:id',
  name: 'taskDetails',
  component: () => import('@/pages/taskDetails/TaskDetailsPage.vue'),
  meta: {
    // мета-данные
  },
}
```

- Lazy loading через `() => import(...)`.
- `name` в camelCase.

### 6. Добавить переводы

1. `locales/ru/[domain]/[page].ts`
2. `locales/en/[domain]/[page].ts`
3. Зарегистрировать в соответствующих `index.ts`.

## Чеклист

- [ ] Папка страницы создана в `src/pages/`
- [ ] `[PageName]Page.vue` с `<script setup lang="ts">`
- [ ] `types.ts` с типами
- [ ] `index.ts` с экспортом
- [ ] Маршрут добавлен в router (lazy loading)
- [ ] Переводы в `locales/ru/` и `locales/en/`
- [ ] Страница только композирует — бизнес-логика в hooks/stores
