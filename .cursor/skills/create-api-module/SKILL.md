# Create API Module

Скилл создания модуля API — слой данных по паттерну Repository: HTTP-функции + TanStack Query hooks + модель.

## Когда использовать

- Интеграция с новым API-эндпоинтом.
- Добавление CRUD-операций для нового домена.
- Создание новых queries/mutations для существующего домена.

## Входные данные

1. **Домен**: название сущности (пример: `tasks`, `forms`, `goals`).
2. **Эндпоинты**: список API-операций (GET, POST, PATCH, DELETE).
3. **Модель данных**: структура запросов и ответов.

## Структура

```
src/
├── api/[domain]/
│   ├── index.ts                    # re-export
│   └── private/
│       └── [operations].ts         # HTTP-функции
├── hooks/requests/[domain]/
│   ├── queries.ts                  # TanStack Query queries
│   └── mutations.ts                # TanStack Query mutations
└── models/
    └── [domain].ts                 # Zod-схема + TypeScript тип
```

## Шаги

### 1. Создать Zod-модель (`models/[domain].ts`)

```ts
import { z } from 'zod'

export const [domain]Schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.coerce.date(),
  // ...
})

export type T[Domain] = z.infer<typeof [domain]Schema>

// Схема для создания (без id и createdAt)
export const create[Domain]Schema = [domain]Schema.omit({
  id: true,
  createdAt: true,
})

export type TCreate[Domain] = z.infer<typeof create[Domain]Schema>

// Схема для обновления (все поля опциональны)
export const update[Domain]Schema = create[Domain]Schema.partial()

export type TUpdate[Domain] = z.infer<typeof update[Domain]Schema>
```

### 2. Создать HTTP-функции (`api/[domain]/private/[operations].ts`)

```ts
import session from '@/api/session'
import type { T[Domain], TCreate[Domain], TUpdate[Domain] } from '@/models/[domain]'

interface I[Domain]Params {
  teamId: number
}

interface I[Domain]ItemParams extends I[Domain]Params {
  itemId: string
}

export const get[Domain]List = ({ teamId }: I[Domain]Params) => {
  return session.get<T[Domain][]>(`/api/teams/${teamId}/[domain]/`)
}

export const get[Domain]ById = ({ teamId, itemId }: I[Domain]ItemParams) => {
  return session.get<T[Domain]>(`/api/teams/${teamId}/[domain]/${itemId}/`)
}

export const create[Domain] = ({ teamId }: I[Domain]Params, body: TCreate[Domain]) => {
  return session.post<T[Domain]>(`/api/teams/${teamId}/[domain]/`, body)
}

export const update[Domain] = ({ teamId, itemId }: I[Domain]ItemParams, body: TUpdate[Domain]) => {
  return session.patch<T[Domain]>(`/api/teams/${teamId}/[domain]/${itemId}/`, body)
}

export const delete[Domain] = ({ teamId, itemId }: I[Domain]ItemParams) => {
  return session.delete(`/api/teams/${teamId}/[domain]/${itemId}/`)
}
```

Правила:

- Функции принимают примитивные параметры, не ref.
- Возвращают `Promise<AxiosResponse<T>>`.
- Не содержат бизнес-логики.

### 3. Создать re-export (`api/[domain]/index.ts`)

```ts
export * from './private/[operations]';
```

### 4. Создать queries (`hooks/requests/[domain]/queries.ts`)

```ts
import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { get[Domain]List, get[Domain]ById } from '@/api/[domain]'

export const [DOMAIN]_LIST_QUERY_KEY = '[domain]ListQueryKey'
export const [DOMAIN]_ITEM_QUERY_KEY = '[domain]ItemQueryKey'

interface I[Domain]QueryParams {
  teamId: MaybeRefOrGetter<number>
}

interface I[Domain]ItemQueryParams extends I[Domain]QueryParams {
  itemId: MaybeRefOrGetter<string>
}

export const use[Domain]ListQuery = ({ teamId }: I[Domain]QueryParams) => {
  return useQuery({
    queryKey: [[DOMAIN]_LIST_QUERY_KEY, { teamId }],
    queryFn: async () => {
      const { data } = await get[Domain]List({
        teamId: toValue(teamId),
      })
      return data
    },
  })
}

export const use[Domain]ItemQuery = ({ teamId, itemId }: I[Domain]ItemQueryParams) => {
  return useQuery({
    queryKey: [[DOMAIN]_ITEM_QUERY_KEY, { teamId, itemId }],
    queryFn: async () => {
      const { data } = await get[Domain]ById({
        teamId: toValue(teamId),
        itemId: toValue(itemId),
      })
      return data
    },
  })
}
```

### 5. Создать mutations (`hooks/requests/[domain]/mutations.ts`)

```ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'

import { create[Domain], update[Domain], delete[Domain] } from '@/api/[domain]'
import { [DOMAIN]_LIST_QUERY_KEY } from './queries'
import type { TCreate[Domain], TUpdate[Domain] } from '@/models/[domain]'

interface I[Domain]MutationParams {
  teamId: MaybeRefOrGetter<number>
}

export const useCreate[Domain] = ({ teamId }: I[Domain]MutationParams) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: TCreate[Domain]) => {
      const { data } = await create[Domain](
        { teamId: toValue(teamId) },
        body,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[DOMAIN]_LIST_QUERY_KEY] })
    },
  })
}

export const useUpdate[Domain] = ({ teamId }: I[Domain]MutationParams) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, body }: { itemId: string; body: TUpdate[Domain] }) => {
      const { data } = await update[Domain](
        { teamId: toValue(teamId), itemId },
        body,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[DOMAIN]_LIST_QUERY_KEY] })
    },
  })
}

export const useDelete[Domain] = ({ teamId }: I[Domain]MutationParams) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      await delete[Domain]({ teamId: toValue(teamId), itemId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[DOMAIN]_LIST_QUERY_KEY] })
    },
  })
}
```

## Правила

- **CRITICAL: Компоненты вызывают ТОЛЬКО hooks, не api напрямую.**
- Параметры hooks: `MaybeRefOrGetter<T>`.
- Внутри hooks: `toValue()` для разворачивания.
- Query keys: константы в UPPER_CASE.
- Мутации инвалидируют связанные queries через `queryClient.invalidateQueries`.
- Модели в `models/` с Zod-схемами.

## Чеклист

- [ ] Модель в `models/[domain].ts` (Zod-схема + типы)
- [ ] HTTP-функции в `api/[domain]/private/`
- [ ] Re-export в `api/[domain]/index.ts`
- [ ] Queries в `hooks/requests/[domain]/queries.ts`
- [ ] Mutations в `hooks/requests/[domain]/mutations.ts`
- [ ] Параметры hooks: `MaybeRefOrGetter<T>`
- [ ] Query keys — именованные константы
- [ ] Мутации инвалидируют связанные queries
