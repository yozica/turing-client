<script setup lang="ts">
import type { Message } from '../../stores';
import { NSpin } from 'naive-ui';

const props = defineProps<{
    message: Message;
    isLoading?: boolean;
}>();
</script>

<template>
    <div
        class="message-item-container"
        :class="{ 'message-item-container--user': message.role === 'user' }"
        v-if="message.role !== 'system'"
    >
        <div
            class="message-item-container__loading"
            v-if="props.isLoading && !props.message.content"
        >
            <n-spin size="small" />
            <span class="message-item-container__loading-text">
                正在思考中...
            </span>
        </div>
        <div class="message-item-container__content">
            <template
                v-if="
                    props.message.role === 'assistant' && props.message.content
                "
            >
                {{ props.message.content }}
            </template>
            <template v-else>
                {{ props.message.content }}
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
.message-item-container {
    display: flex;
    flex-direction: column;
    width: 70%;

    .message-item-container__content {
        border-radius: 12px;
        padding: 5px 0;
    }
}

.message-item-container.message-item-container--user {
    align-items: flex-end;

    .message-item-container__content {
        width: fit-content;
        background-color: #f0f0f0;
        padding: 5px 10px;
        white-space: pre-line;
    }
}

.message-item-container__loading {
    display: flex;
    align-items: center;
    gap: 8px;

    .message-item-container__loading-text {
        color: #666;
        font-size: 12px;
    }
}
</style>
