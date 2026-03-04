# Figma to Code

Скилл конвертации макета из Figma в Vue-компонент проекта.

## Когда использовать

- Пользователь предоставил ссылку на Figma-макет.
- Нужно реализовать UI по дизайну.
- Нужно сверить реализацию с макетом.

## Входные данные

1. **URL Figma**: ссылка на дизайн (формат: `figma.com/design/:fileKey/:fileName?node-id=:nodeId`).
2. **Расположение компонента**: куда поместить в проекте.
3. **Имя компонента**: как назвать (если не указано — определить по содержимому макета).

## Шаги

### 1. Извлечь параметры из URL

Из URL Figma извлечь:

- `fileKey` — идентификатор файла.
- `nodeId` — идентификатор узла (заменить `-` на `:`).

Примеры:

```
figma.com/design/ABC123/MyDesign?node-id=10-20
→ fileKey = "ABC123", nodeId = "10:20"

figma.com/design/ABC123/branch/DEF456/MyDesign?node-id=10-20
→ fileKey = "DEF456" (branchKey), nodeId = "10:20"
```

### 2. Получить дизайн из Figma MCP

Вызвать Figma MCP `get_design_context`:

```
get_design_context({ fileKey: "ABC123", nodeId: "10:20" })
```

При необходимости получить скриншот:

```
get_screenshot({ fileKey: "ABC123", nodeId: "10:20" })
```

### 3. Проанализировать результат

Figma MCP возвращает React + Tailwind код. Проанализировать:

- Структуру компонента (иерархию элементов).
- Цвета (маппинг на переменные темы).
- Типографику (маппинг на переменные шрифтов).
- Отступы и размеры.
- Интерактивные элементы.
- Существующие UIKit-компоненты, которые можно переиспользовать.

### 4. Маппинг на систему дизайна проекта

| Figma / React        | Проект                                                    |
| -------------------- | --------------------------------------------------------- |
| JSX                  | Vue `<template>` с BEM                                    |
| `className="..."`    | BEM-классы (`.block__element--modifier`)                  |
| Tailwind `text-sm`   | `$size-sm` из `_variables.scss`                           |
| Tailwind `font-bold` | `$weight-bold` из `_variables.scss`                       |
| Hex `#RRGGBB`        | CSS-переменные из `_theme.scss` (`$surface-primary`, ...) |
| `onClick`            | `@click`                                                  |
| `useState`           | `ref` / `reactive`                                        |
| `<Button>`           | `Button` из `@/components/UiKit/buttons`                  |
| `<Input>`            | `InputBase` из `@/components/UiKit/vueInput`              |
| `<Select>`           | `Select` из `@/components/UiKit/selects`                  |
| Иконки               | `svgIcons` из `@/constants/icons`                         |

### Таблица маппинга цветов

Основные переменные цветов из `_theme.scss`:

| Назначение              | CSS-переменная             |
| ----------------------- | -------------------------- |
| Основной фон            | `$background-main-primary` |
| Поверхность             | `$surface-primary`         |
| Текст основной          | `$text-primary`            |
| Текст вторичный         | `$text-secondary`          |
| Акцент (бренд)          | `$accent-brand-primary`    |
| Акцент (позитив)        | `$accent-positive-primary` |
| Акцент (негатив)        | `$accent-negative-primary` |
| Акцент (предупреждение) | `$accent-warning-primary`  |
| Разделитель             | `$border-primary`          |

### 5. Создать компонент

Использовать подагент **create-component**:

1. Создать папку `vue[ComponentName]/`.
2. `types.ts` — типы из анализа макета.
3. `[ComponentName].vue` — адаптированный Vue SFC.
4. `index.ts` — экспорт.
5. Переводы в `locales/`.

### 6. Сверить результат

- Визуально сравнить реализацию со скриншотом из Figma.
- Проверить hover-состояния (`@include hover { ... }`).
- Проверить адаптивность (если применимо).
- Убедиться что используются UIKit-компоненты где возможно.

## Правила

- **CRITICAL: Не копировать React/Tailwind код напрямую — адаптировать.**
- Цвета ТОЛЬКО из `_theme.scss`.
- Типографика ТОЛЬКО из `_variables.scss`.
- Переиспользовать UIKit-компоненты (Button, Input, Select, Toast, и т.д.).
- Текст через `$t()` — никогда хардкод.
- BEM-классы обязательны.
- `<style lang="scss" scoped>`.

## Чеклист

- [ ] URL Figma разобран (fileKey, nodeId)
- [ ] `get_design_context` вызван
- [ ] Скриншот получен для визуальной сверки
- [ ] React -> Vue адаптация выполнена
- [ ] Tailwind -> SCSS с переменными `_theme.scss`
- [ ] UIKit-компоненты использованы где возможно
- [ ] BEM-классы
- [ ] Переводы в `locales/`
- [ ] Hover-состояния через `@include hover { ... }`
- [ ] Компонент создан по подагенту create-component
