<template>
    <div class="screen-tab-loading">
        <VProgressCircular
            class="screen-tab-loading__spinner"
            indeterminate
            color="primary"
            :size="32"
            :width="3"
        />
    </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.screen-tab-loading {
    height: 100%;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    &__spinner {
        flex: 0 0 auto;
    }
}
</style>



