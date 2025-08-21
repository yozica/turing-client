import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSideBarStore = defineStore('sideBar', () => {
    // 侧边栏是否固定
    const sideBarFixed = ref(true);

    // 切换侧边栏固定状态
    const toggleSidebar = () => {
        sideBarFixed.value = !sideBarFixed.value;
        return sideBarFixed.value;
    };

    return {
        sideBarFixed,
        toggleSidebar,
    };
});
