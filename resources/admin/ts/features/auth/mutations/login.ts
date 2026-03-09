import { useMutation, useQueryCache } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { client } from '@/ts/shared/api'
import type { LoginFormValues } from '../forms/login'
import { routeNames } from '@/ts/shared/const'

const login = async (payload: LoginFormValues) => {
    await client.post('/login', payload)
}

export const useLoginMutation = () => {
    const queryCache = useQueryCache()
    const router = useRouter()

    return useMutation({
        mutation: login,
        async onSuccess() {
            await queryCache.invalidateQueries({ key: ['user', 'me'] })
            await router.push({ name: routeNames.Authenticated })
        },
    })
}
