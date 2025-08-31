<script setup lang="ts">
import { ref } from "vue";
import { NScrollbar } from "naive-ui";
import type { Message } from "../../stores";
import MessageItem from "../MessageItem/index.vue";

const props = defineProps<{
    messages: Message[];
    isLoading: boolean;
    loadingTitle: string;
    loadingMessageId?: string;
    loadingRagNum: number;
}>();

const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);

// 滚动到底部
const scrollToBottom = () => {
    if (scrollbarRef.value) {
        // 使用 Naive UI Scrollbar 的 scrollTo 方法
        scrollbarRef.value.scrollTo({
            behavior: "smooth",
            top: scrollbarRef.value.$el?.nextElementSibling?.querySelector(
                ".n-scrollbar-content"
            )?.offsetHeight,
        });
    }
};

// 暴露方法给父组件
defineExpose({
    scrollToBottom,
});
</script>

<template>
    <div class="message-list-container">
        <div class="message-list-container__mask-top"></div>
        <n-scrollbar ref="scrollbarRef">
            <div class="message-list-container__content">
                <MessageItem
                    v-for="message in props.messages"
                    :key="message.id"
                    :message="message"
                    :isLoading="
                        props.isLoading && loadingMessageId === message.id
                    "
                    :loading-title="props.loadingTitle"
                    :loading-rag-num="loadingRagNum"
                />
            </div>
        </n-scrollbar>

        <div class="message-list-container__mask-bottom"></div>
    </div>
</template>

<style scoped lang="scss">
.message-list-container {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;

    .message-list-container__mask-top,
    .message-list-container__mask-bottom {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        height: 40px;
        z-index: 1;
    }

    .message-list-container__mask-top {
        top: 0;
        background: linear-gradient(
            rgba(#fff, 1) 0%,
            rgba(#fff, 0) 70%,
            rgba(#fff, 0) 100%
        );
    }

    .message-list-container__mask-bottom {
        bottom: 0;
        background: linear-gradient(
            rgba(#fff, 0) 0%,
            rgba(#fff, 1) 80%,
            rgba(#fff, 1) 100%
        );
    }

    .message-list-container__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        width: 100%;
        height: 100%;
        margin: 0 auto;
        padding: 20px 0;
    }
}
</style>
