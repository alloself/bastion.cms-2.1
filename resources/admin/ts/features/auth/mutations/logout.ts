import { useMutation, useQueryCache } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { client } from '@/ts/shared/api'
import { routeNames } from '@/ts/shared/const'

const logout = async () => {
    await client.post('/logout')
}

export const useLogoutMutation = () => {
    const queryCache = useQueryCache()
    const router = useRouter()

    return useMutation({
        mutation: logout,
        async onSettled() {
            queryCache.invalidateQueries({ key: ['user', 'me'] })
            await router.push({ name: routeNames.Login })
        },
    })
}
