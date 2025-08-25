<script setup lang="ts">
import type { Message } from '../../stores';
import { NAvatar } from 'naive-ui';

const props = defineProps<{
    message: Message;
    assistantAvatar: string;
}>();
</script>

<template>
    <div
        class="message-item-container"
        :class="{ 'message-item-container--user': message.role === 'user' }"
    >
        <n-avatar
            v-if="props.message.role === 'assistant'"
            :src="props.assistantAvatar"
            color="transparent"
            :size="30"
        />
        <div class="message-item-container__content">
            <div class="message-text">{{ message.content }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.message-item-container {
    display: flex;
    flex-direction: column;
    width: 70%;

    .message-item-container__avatar {
        width: 40px;
        height: 40px;
    }

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
    }
}
</style>
