<script setup lang="ts">
import { computed } from 'vue';
import { useSideBarStore } from '../../stores';

const sideBarStore = useSideBarStore();

const sideBarFixed = computed(() => sideBarStore.sideBarFixed);
</script>

<template>
    <div
        class="chat-area-container"
        :style="{
            width: sideBarFixed ? 'calc(100% - 234px)' : '100%',
            marginLeft: sideBarFixed ? '234px' : '0',
        }"
    >
        <div class="chat-area-container-box"></div>
    </div>
</template>

<style scoped lang="scss">
.chat-area-container {
    width: 100%;
    height: 100vh;
    padding: 6px;
    transition: width 0.3s ease, margin-left 0.3s ease;

    .chat-area-container-box {
        width: 100%;
        height: 100%;
        background: #ffffff;
        border-radius: 8px;
    }
}
</style>
