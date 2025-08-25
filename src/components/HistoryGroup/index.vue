<script setup lang="ts">
import type { Conversation } from '../../stores';
import HistoryItem from '../HistoryItem/index.vue';

const props = defineProps<{
    conversations: Conversation[];
    date: string;
}>();
</script>

<template>
    <div class="history-group-container">
        <div class="history-group-container__date">
            {{ props.date }}
        </div>
        <HistoryItem
            v-for="conversation in props.conversations"
            :key="conversation.id"
            :conversation="conversation"
        />
    </div>
</template>

<style lang="scss" scoped>
.history-group-container {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .history-group-container__date {
        font-size: 12px;
        color: #6c757d;
        font-weight: 500;
        padding: 8px 12px;
    }
}
</style>
