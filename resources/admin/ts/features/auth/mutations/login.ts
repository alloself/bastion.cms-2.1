import { useMutation, useQueryCache } from '@pinia/colada'
import { useRoute, useRouter } from 'vue-router'
import { client } from '@/ts/shared/api'
import { currentUserQuery } from '@/ts/entities/user'
import type { LoginFormValues } from '../forms/login'
import { routeNames } from '@/ts/shared/const'

const login = async (payload: LoginFormValues) => {
    await client.post('/login', payload)
}

export const useLoginMutation = () => {
    const queryCache = useQueryCache()
    const router = useRouter()
    const route = useRoute()

    return useMutation({
        mutation: login,
        async onSuccess() {
            await queryCache.refresh(queryCache.ensure(currentUserQuery))

            const redirect = route.query.redirect

            if (redirect && typeof redirect === 'string') {
                await router.push(redirect)
            } else {
                await router.push({ name: routeNames.Authenticated })
            }
        },
    })
}
