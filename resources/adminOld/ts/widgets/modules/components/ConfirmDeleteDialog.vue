<template>
    <VDialog v-model="isVisible" max-width="400" persistent>
        <VCard>
            <VCardTitle class="text-h6">{{ title }}</VCardTitle>
            <VCardText>{{ message }}</VCardText>
            <VCardActions>
                <VSpacer />
                <VBtn variant="text" :disabled="loading" @click="handleCancel">
                    {{ cancelText }}
                </VBtn>
                <VBtn color="error" variant="flat" :loading="loading" @click="handleConfirm">
                    {{ confirmText }}
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts">
const {
    title = 'Подтверждение удаления',
    message = 'Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.',
    cancelText = 'Отмена',
    confirmText = 'Удалить',
    loading = false,
} = defineProps<{
    title?: string
    message?: string
    cancelText?: string
    confirmText?: string
    loading?: boolean
}>()

const emit = defineEmits<{
    confirm: [void]
}>()

const isVisible = defineModel<boolean>({ required: true })

const handleCancel = () => {
    isVisible.value = false
}

const handleConfirm = () => {
    emit('confirm')
}
</script>
