<script setup lang="ts">
import SideBar from './components/SideBar/index.vue';
import ChatArea from './components/ChatArea/index.vue';
</script>

<template>
    <div class="app-container">
        <SideBar />
        <ChatArea />
    </div>
</template>

<style scoped lang="scss">
.app-container {
    position: relative;
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>
