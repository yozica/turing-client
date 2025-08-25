<script setup lang="ts">
import { inject, ref } from 'vue';
import { NIcon, NDropdown, useDialog } from 'naive-ui';
import { useChatStore, type Conversation } from '../../stores';
import { MoreHorizontal24Regular } from '@vicons/fluent';

const props = defineProps<{
    conversation: Conversation;
}>();

const currentConversation = inject<Conversation>('currentConversation');
const isEditing = ref(false);
const editTitle = ref('');

const chatStore = useChatStore();

const selectConversation = (id: string) => {
    if (!isEditing.value) {
        chatStore.selectConversation(id);
    }
};

const dialog = useDialog();

const deleteConversation = (id: string, title: string) => {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除对话 "${title}" 吗？此操作不可恢复。`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => {
            chatStore.deleteConversation(id);
        }
    });
};

const startEditing = () => {
    isEditing.value = true;
    editTitle.value = props.conversation.title;
    // 下一个tick聚焦输入框
    setTimeout(() => {
        const input = document.querySelector('.history-item-container__input') as HTMLInputElement;
        if (input) {
            input.focus();
            input.select();
        }
    }, 0);
};

const saveEdit = () => {
    if (editTitle.value.trim() && editTitle.value.trim() !== props.conversation.title) {
        chatStore.renameConversation(props.conversation.id, editTitle.value.trim());
    }
    isEditing.value = false;
};

const cancelEdit = () => {
    isEditing.value = false;
    editTitle.value = '';
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        saveEdit();
    } else if (event.key === 'Escape') {
        cancelEdit();
    }
};

const toolsOptions = [
    {
        label: '重命名',
        key: 'changeName',
    },
    {
        label: '删除',
        key: 'delete',
    },
];

const handleSelectTools = (key: string) => {
    switch (key) {
        case 'changeName':
            startEditing();
            break;
        case 'delete':
            deleteConversation(props.conversation.id, props.conversation.title);
            break;
    }
};
</script>

<template>
    <div
        :key="conversation.id"
        class="history-item-container"
        :class="{
            active: currentConversation?.id === conversation.id,
            editing: isEditing,
        }"
        @click="selectConversation(conversation.id)"
    >
        <div v-if="isEditing" class="history-item-container__input-wrapper">
            <input
                class="history-item-container__input"
                v-model="editTitle"
                @blur="saveEdit"
                @keydown="handleKeydown"
                @click.stop
            />
        </div>
        <div v-else class="history-item-container__text">
            {{ conversation.title }}
        </div>
        <div class="history-item-container__mask"></div>
        <div class="history-item-container__tools">
            <n-dropdown
                trigger="hover"
                :options="toolsOptions"
                @select="handleSelectTools"
            >
                <n-icon><MoreHorizontal24Regular /></n-icon>
            </n-dropdown>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.history-item-container {
    position: relative;
    width: 100%;
    height: 38px;
    border-radius: 8px;
    padding: 0 12px;
    cursor: pointer;
    background-color: var(--item-bg);

    --item-bg: #f5f5f5;
    --mask-width: 30px;

    &:hover {
        --item-bg: #e9ecef;
    }

    &.active {
        --item-bg: #bae7ff;
        color: #1890ff;
        font-weight: 500;
    }

    &.editing {
        --item-bg: #ffffff;
        box-shadow: 0 0 0 1px #1890ff;
    }

    .history-item-container__text {
        width: 100%;
        height: 100%;
        line-height: 38px;
        overflow: hidden;
        white-space: nowrap;
        user-select: none;
    }

    .history-item-container__input-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .history-item-container__input {
        width: 100%;
        height: 28px;
        border: none;
        outline: none;
        background: transparent;
        font-size: inherit;
        color: inherit;
        padding: 0;
        margin: 0;
    }

    .history-item-container__mask {
        position: absolute;
        top: 0;
        right: 0;
        width: var(--mask-width);
        height: 100%;
        background: linear-gradient(
            90deg,
            rgba(249, 251, 255, 0) 0%,
            var(--item-bg) 50%,
            var(--item-bg) 100%
        );
        border-radius: 0 8px 8px 0;
    }

    &:hover,
    &.active {
        --mask-width: 83px;

        .history-item-container__tools {
            display: flex;
        }
    }

    .history-item-container__tools {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        display: none;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 4px;

        &:hover {
            background-color: #f5f5f5;
        }
    }
}
</style>
