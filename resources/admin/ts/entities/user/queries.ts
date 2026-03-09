import { defineQueryOptions } from '@pinia/colada'
import { getCurrentUser } from './api'

export const currentUserQuery = defineQueryOptions({
    key: ['user', 'me'],
    query: getCurrentUser,
    staleTime: Infinity,
})
