# Create Widget

Скилл создания виджета (widget) — крупного самодостаточного блока UI, композирующего несколько компонентов.

## Когда использовать

- Блок UI, объединяющий несколько компонентов с общей логикой.
- Самодостаточный фрагмент страницы (конструктор форм, таблица задач, канбан-доска).
- Компонент с собственным state management и API-интеграцией.

## Входные данные

1. **Имя виджета**: PascalCase (пример: `FormConstructor`, `TaskBoard`).
2. **Назначение**: что делает виджет.
3. **Подкомпоненты**: из каких частей состоит.
4. **Данные**: какие API-запросы нужны.

## Структура

```
src/widgets/[widgetName]/
├── [WidgetName].vue       # Основной SFC-компонент виджета
├── types.ts               # Типы, интерфейсы, enums
├── index.ts               # Публичный экспорт
├── const.ts               # Константы (при необходимости)
├── apiMapping.ts          # Маппинг API-данных (при необходимости)
└── components/            # Подкомпоненты виджета
    ├── [SubComponent1].vue
    ├── [SubComponent2].vue
    └── ...
```

## Шаги

### 1. Создать папку виджета

Путь: `src/widgets/[widgetName]/`

### 2. Создать `types.ts`

```ts
export enum E[WidgetMode] {
  MODE_A = 'mode_a',
  MODE_B = 'mode_b',
}

export interface I[WidgetName]Props {
  teamId: number
  viewId: number
  mode: E[WidgetMode]
}

export interface I[SubItem] {
  id: string
  title: string
  // ...
}
```

### 3. Создать `[WidgetName].vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I[WidgetName]Props } from './types'

defineOptions({ name: '[WidgetName]' })

const { teamId, viewId, mode } = defineProps<I[WidgetName]Props>()

const emit = defineEmits<{
  modeChange: [mode: E[WidgetMode]]
}>()

const { t } = useI18n()

// Hooks для данных
// const { data, isLoading } = use[Domain]Query({ teamId, viewId })
</script>

<template>
  <div class="[widget-name]">
    <!-- Композиция подкомпонентов -->
  </div>
</template>

<style lang="scss" scoped>
.[widget-name] {
  //
}
</style>
```

### 4. Создать `index.ts`

```ts
export { default as [WidgetName] } from './[WidgetName].vue'
export * from './types'
export * from './const'
```

### 5. Создать подкомпоненты в `components/`

Подкомпоненты виджета НЕ экспортируются наружу. Они используются только внутри виджета.

### 6. Добавить переводы

1. `locales/ru/[domain]/[widget].ts`
2. `locales/en/[domain]/[widget].ts`

## Отличие от компонента

| Аспект            | Компонент              | Виджет                        |
| ----------------- | ---------------------- | ----------------------------- |
| Расположение      | `components/`          | `widgets/`                    |
| Самодостаточность | Зависит от props/emits | Полностью автономен           |
| API-интеграция    | Через props            | Использует hooks напрямую     |
| Состояние         | Минимальное, локальное | Может иметь сложное состояние |
| Подкомпоненты     | Опционально            | Как правило, есть             |

## Чеклист

- [ ] Папка создана в `src/widgets/`
- [ ] `types.ts` с типами, enums
- [ ] `[WidgetName].vue` с `<script setup lang="ts">`
- [ ] `index.ts` с публичным экспортом
- [ ] Подкомпоненты в `components/`
- [ ] Переводы в `locales/`
- [ ] API-данные через hooks, не напрямую
