<script setup lang="ts">
import Context from './Context.vue';
import SideBar from './components/SideBar/index.vue';
import ChatArea from './components/ChatArea/index.vue';
</script>

<template>
    <Context>
        <div class="app-container">
            <ChatArea />
            <SideBar />
        </div>
    </Context>
</template>

<style scoped lang="scss">
.app-container {
    position: relative;
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>
