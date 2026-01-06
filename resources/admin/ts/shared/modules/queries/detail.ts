import { toValue, type MaybeRefOrGetter } from "vue";
import type { IModule } from "..";
import type { IBaseEntity, TUUID } from "../../types";
import { useMutation, useQuery } from "@pinia/colada";
import {
    getModuleDetailQuery,
    createModuleDetailQuery,
    updateModuleDetailQuery,
    deleteModuleDetailQuery,
} from "../api";

export const useModuleDetailQuery = <T extends IBaseEntity>(
    module: MaybeRefOrGetter<IModule<T>>,
    id: MaybeRefOrGetter<TUUID | undefined>
) => {
    const moduleValue = toValue(module);
    const getIdValue = () => toValue(id);

    const detailQuery = useQuery({
        key: () => ["detail", moduleValue.key, getIdValue() ?? "create"],
        query: async () => {
            const idValue = getIdValue();
            if (!idValue) {
                return null;
            }
            return getModuleDetailQuery(moduleValue, idValue);
        },
        enabled: () => !!getIdValue(),
    });

    const createMutation = useMutation({
        mutation: (payload: Partial<T>) =>
            createModuleDetailQuery<T>(moduleValue, payload),
    });

    const updateMutation = useMutation({
        mutation: ({ id, payload }: { id: TUUID; payload: Partial<T> }) =>
            updateModuleDetailQuery<T>(moduleValue, id, payload),
    });

    const deleteMutation = useMutation({
        mutation: (id: TUUID) => deleteModuleDetailQuery<T>(moduleValue, id),
    });

    return { detailQuery, createMutation, updateMutation, deleteMutation };
};
