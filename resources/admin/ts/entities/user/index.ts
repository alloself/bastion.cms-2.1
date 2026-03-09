import { useQuery } from '@pinia/colada'
import { currentUserQuery } from './queries'

export { currentUserQuery } from './queries'
export { getCurrentUser } from './api'

export const useCurrentUser = () => useQuery(currentUserQuery)
