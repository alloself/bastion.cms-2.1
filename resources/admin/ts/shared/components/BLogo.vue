<template>
    <a class="logo" href="/">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.2 58.51">
            <title>Bustion</title>
            <g>
                <path
                    class="color-1"
                    d="M23.63.65a5,5,0,0,1,4.94,0l10.58,6,10.49,6.17a5,5,0,0,1,2.46,4.27l.1,12.16-.1,12.17a5,5,0,0,1-2.46,4.27L39.15,51.86l-10.58,6a5.05,5.05,0,0,1-4.94,0l-10.58-6L2.56,45.69A5,5,0,0,1,.1,41.42L0,29.25.1,17.09a5,5,0,0,1,2.46-4.27L13.05,6.65Z"
                />
                <path
                    class="color-2"
                    d="M26.1,9l8.11,4.6,8,4.73.07,9.32L42.25,37l-8,4.72-8.11,4.6L18,41.68,10,37l-.07-9.33L10,18.31l8-4.73Z"
                />
                <path
                    class="color-2"
                    d="M34.21,13.58,26.1,9v37.3l8.11-4.6,8-4.72.07-9.33-.07-9.32Z"
                />
                <path
                    class="color-2"
                    d="M34.21,37.09,26.1,32.5,18,37.09l-8,4.73,8,4.73,8.11,4.59,8.11-4.59,8-4.73Z"
                />
            </g>
        </svg>
    </a>
</template>
<style lang="scss" scoped>
.logo {
    height: 100%;
    display: flex;
    align-items: center;
    height: 28px;
    margin-left: 12px;

    svg {
        height: 100%;
    }
}

.color-1 {
    fill: #096ed1;
}

.color-2 {
    fill: #fff;
    opacity: 0.3;
    isolation: isolate;
}
</style>
