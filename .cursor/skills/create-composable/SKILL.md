# Create Composable

Скилл создания Vue composable (хук) для инкапсуляции переиспользуемой клиентской логики.

## Когда использовать

- Логика повторяется в 2+ компонентах.
- Нужно инкапсулировать реактивное состояние + функции.
- Работа с DOM (resize, scroll, intersection).
- Абстракция поверх VueUse composables.

## Входные данные

1. **Имя**: `use[Feature]` (camelCase с префиксом `use`).
2. **Параметры**: входные данные (реактивные или нет).
3. **Возвращаемое значение**: что composable отдаёт потребителю.
4. **Расположение**: `src/composables/` (глобальные) или `hooks.ts` рядом с компонентом (локальные).

## Шаблон файла

### Глобальный composable (`src/composables/use[Feature].ts`)

```ts
import { type MaybeRefOrGetter, toValue, ref, computed, watch } from 'vue'

/**
 * Описание назначения composable
 */
export const use[Feature] = (
  param1: MaybeRefOrGetter<TParamType>,
  param2: MaybeRefOrGetter<TParamType2> = defaultValue,
) => {
  // Внутреннее состояние
  const internalState = ref<TStateType>(initialValue)

  // Вычисляемые значения
  const derivedValue = computed(() => {
    const rawParam = toValue(param1)
    // логика
    return rawParam
  })

  // Функции-действия
  const doSomething = () => {
    // логика
  }

  const reset = () => {
    internalState.value = initialValue
  }

  // Watch при необходимости
  watch(
    () => toValue(param1),
    (newValue) => {
      // реакция на изменение параметра
    },
  )

  return {
    internalState,
    derivedValue,
    doSomething,
    reset,
  }
}
```

## Правила

### Входные параметры

- **CRITICAL: Параметры типа `MaybeRefOrGetter<T>`** — composable должен работать с `ref`, `computed`, getter-функциями и обычными значениями.
- Внутри использовать `toValue(param)` для разворачивания.
- Значения по умолчанию задавать в сигнатуре.

### Возвращаемое значение

- **CRITICAL: Возвращать объект с `ref`, `reactive`, `computed` или функциями.**
- Не возвращать примитивы — только обёртки Vue reactivity.
- Именовать поля осмысленно.

### Именование

- Файл: `use[Feature].ts` (camelCase).
- Экспорт: `export const use[Feature] = (...)`.
- Пример: `useTextOverflow`, `useSelection`, `useTasksContext`.

### Side effects

- Если composable создаёт side effects (подписки, таймеры), очищать через `onUnmounted` или `onScopeDispose`.

```ts
import { onScopeDispose } from 'vue';

export const usePolling = (callback: () => void, interval: MaybeRefOrGetter<number> = 5000) => {
  const timerId = setInterval(callback, toValue(interval));

  onScopeDispose(() => {
    clearInterval(timerId);
  });
};
```

### VueUse

- Перед созданием composable проверить, нет ли аналога в VueUse (`@vueuse/core`).
- Если аналог есть — использовать его напрямую или создать тонкую обёртку.
- Для DOM-подписок — только VueUse (`useEventListener`, `useResizeObserver`, ...).

## Чеклист

- [ ] Имя начинается с `use`
- [ ] Параметры: `MaybeRefOrGetter<T>`
- [ ] Внутри: `toValue()` для разворачивания параметров
- [ ] Возвращает: объект с `ref` / `computed` / функции
- [ ] Нет `any`, нет `as`
- [ ] Side effects очищаются через `onScopeDispose` / `onUnmounted`
- [ ] Проверен аналог в VueUse
- [ ] Файл в `src/composables/` (глобальный) или `hooks.ts` (локальный)
