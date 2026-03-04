# Create Store

Скилл создания Pinia store для управления глобальным состоянием.

## Когда использовать

- Глобальное состояние, разделяемое между несколькими компонентами/страницами.
- Состояние, переживающее навигацию между страницами.
- Пользовательские настройки, аутентификация, тема.
- Состояние, не привязанное к конкретному API-запросу (для API использовать TanStack Query).

## Входные данные

1. **Домен**: название области (пример: `auth`, `theme`, `billing`).
2. **Состояние**: какие данные хранит store.
3. **Действия**: какие операции поддерживает.

## Структура

```
src/stores/[domain]/
├── use[Domain]Store.ts    # Основной store
└── index.ts               # Re-export (при нескольких stores в домене)
```

## Шаблон

### `use[Domain]Store.ts`

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { TNullable } from '@/types/utility'

export const use[Domain]Store = defineStore('[domain]', () => {
  // === State ===
  const items = ref<TItem[]>([])
  const selectedId = ref<TNullable<string>>(null)
  const isLoading = ref(false)

  // === Getters ===
  const selectedItem = computed(() =>
    items.value.find((item) => item.id === selectedId.value) ?? null,
  )

  const itemCount = computed(() => items.value.length)

  const isEmpty = computed(() => items.value.length === 0)

  // === Actions ===
  const setItems = (newItems: TItem[]) => {
    items.value = newItems
  }

  const selectItem = (id: string) => {
    selectedId.value = id
  }

  const clearSelection = () => {
    selectedId.value = null
  }

  const reset = () => {
    items.value = []
    selectedId.value = null
    isLoading.value = false
  }

  return {
    // State
    items,
    selectedId,
    isLoading,
    // Getters
    selectedItem,
    itemCount,
    isEmpty,
    // Actions
    setItems,
    selectItem,
    clearSelection,
    reset,
  }
})
```

## Правила

### Стиль

- **CRITICAL: Только Composition API (setup function).** Не использовать Options API.
- `defineStore('storeName', () => { ... })` — setup-синтаксис.

### Именование

- Файл: `use[Domain]Store.ts`.
- Store ID: `[domain]` в camelCase (пример: `'auth'`, `'userProfile'`, `'billing'`).
- Экспорт: `export const use[Domain]Store = defineStore(...)`.

### Структура внутри

Порядок секций:

1. **State** — `ref`, `reactive`.
2. **Getters** — `computed`.
3. **Actions** — функции.
4. **Return** — все публичные поля.

### Состояние vs Данные

- **Store** — для глобального UI-состояния, настроек, сессии.
- **TanStack Query** — для серверных данных (кэширование, рефетчинг, инвалидация).
- Не дублировать серверные данные в store — использовать hooks/queries.

### Reset

- Каждый store должен иметь функцию `reset()` для очистки состояния.
- `reset()` вызывается при логауте или смене контекста.
- Интеграция с `resetPiniaStores()` из `stores/reset.ts`.

## Примеры из проекта

- `stores/auth/useAuthStore.ts` — аутентификация, токены
- `stores/theme/useThemeStore.ts` — тема (light/dark)
- `stores/user/useUserProfileStore.ts` — профиль пользователя

## Чеклист

- [ ] Файл в `stores/[domain]/use[Domain]Store.ts`
- [ ] Composition API (setup function)
- [ ] State, Getters, Actions — в правильном порядке
- [ ] Функция `reset()` для очистки
- [ ] Нет `any`, нет `as`
- [ ] Store ID в camelCase
- [ ] Серверные данные — через TanStack Query, не в store
