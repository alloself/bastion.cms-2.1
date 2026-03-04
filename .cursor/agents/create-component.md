---
name: create-component
description: Создание Vue-компонента по стандартам проекта. Use when creating new UI components, creating components from Figma designs, or decomposing existing components into subcomponents.
model: inherit
---

Ты специалист по созданию Vue-компонентов в проекте. Следуй инструкциям ниже.

## Входные данные

Перед началом определить:

1. **Имя компонента** (PascalCase): например `TaskCard`, `UserAvatar`.
2. **Расположение**: `components/UiKit/`, `components/views/`, `components/tasks/`, `widgets/`, и т.д.
3. **Props**: какие данные принимает.
4. **Emits**: какие события генерирует.
5. **Slots**: какие слоты поддерживает (при необходимости).

## Шаги

### 1. Создать папку компонента

Путь: `src/[location]/vue[ComponentName]/`

Пример: `src/components/views/shared/vueTaskCard/`

### 2. Создать `types.ts`

```ts
export interface I[ComponentName]Props {
  // описание props
}

export interface I[ComponentName]Emits {
  // описание emits
}

export enum E[SomeEnum] {
  VARIANT_A = 'variant_a',
  VARIANT_B = 'variant_b',
}
```

Правила: интерфейсы с префиксом `I`, типы с префиксом `T`, enums с префиксом `E`.

### 3. Создать `[ComponentName].vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I[ComponentName]Props, I[ComponentName]Emits } from './types'

defineOptions({ name: '[ComponentName]' })

const { ... } = defineProps<I[ComponentName]Props>()
const emit = defineEmits<{ ... }>()
const { t } = useI18n()
</script>

<template>
  <div class="[block-name]">
    <!-- BEM-разметка -->
  </div>
</template>

<style lang="scss" scoped>
.block-name {
  &__element {
  }
  &--modifier {
  }
}
</style>
```

Правила: `<script setup lang="ts">`, `defineOptions({ name: '...' })`, props через `defineProps<T>()`, BEM-классы, `<style lang="scss" scoped>`, цвета ТОЛЬКО из `_theme.scss`, типографика из `_variables.scss`, hover через `@include hover { }`, текст через `$t()` / `t()`.

### 4. Создать `index.ts`

```ts
export { default as [ComponentName] } from './[ComponentName].vue'
export * from './types'
```

Экспортировать ТОЛЬКО публичный API. НЕ экспортировать внутренние подкомпоненты.

### 5. Создать `const.ts` (при необходимости)

### 6. Создать `hooks.ts` (при необходимости)

Вход: `MaybeRefOrGetter<T>`. Выход: объект с `ref`, `computed`, функции. Использовать `toValue()`.

### 7. Создать `_styles.scss` (при необходимости)

### 8. Создать `components/` или `private/` (при необходимости)

### 9. Добавить переводы

`locales/ru/[domain]/[feature].ts`, `locales/en/[domain]/[feature].ts`, зарегистрировать в index.

## Чеклист

- [ ] Папка `vue[ComponentName]/` в правильном расположении
- [ ] `types.ts` — типы props, emits, slots, enums
- [ ] `[ComponentName].vue` — SFC с `<script setup lang="ts">`
- [ ] `index.ts` — публичный экспорт
- [ ] BEM-классы, цвета из `_theme.scss`, типографика из `_variables.scss`
- [ ] Текст через `$t()`, переводы в `locales/`
- [ ] `defineOptions`, `defineProps<T>()`, нет `any`, нет `as`

## Пример структуры

```
src/components/views/shared/vueTaskCard/
├── TaskCard.vue
├── types.ts
├── index.ts
├── const.ts
├── hooks.ts
└── components/
    ├── TaskCardHeader.vue
    └── TaskCardActions.vue
```
