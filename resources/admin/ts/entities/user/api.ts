import type { User } from '@shared/types/models'
import { client } from '@/ts/shared/api'

export const getCurrentUser = async () => {
    const { data } = await client.get<User>('/api/admin/me')
    return data
}
