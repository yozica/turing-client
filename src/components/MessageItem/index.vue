<script setup lang="ts">
import type { Message } from '../../stores';
import { NAvatar, NSpin } from 'naive-ui';
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';

const props = defineProps<{
    message: Message;
    assistantAvatar: string;
    isLoading?: boolean;
}>();

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

const renderedContent = computed(() => {
    if (props.message.role === 'assistant' && props.message.content) {
        return md.render(props.message.content);
    }
    return props.message.content;
});
</script>

<template>
    <div
        class="message-item-container"
        :class="{ 'message-item-container--user': message.role === 'user' }"
        v-if="message.role !== 'system'"
    >
        <n-avatar
            v-if="props.message.role === 'assistant'"
            :src="props.assistantAvatar"
            color="transparent"
            :size="30"
        />
        <div class="message-item-container__content">
            <template v-if="props.isLoading && !props.message.content">
                <n-spin size="small" />
                <span class="message-item-container__loading-text">
                    正在思考中...
                </span>
            </template>
            <template
                v-else-if="
                    props.message.role === 'assistant' && props.message.content
                "
            >
                <div v-html="renderedContent" class="markdown-content"></div>
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
        white-space: pre-line;
    }
}

.message-item-container__loading-text {
    margin-left: 8px;
    color: #666;
    font-size: 12px;
}

.markdown-content {
    line-height: 1.6;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 1em 0 0.5em 0;
        font-weight: 600;
    }

    p {
        margin: 0.5em 0;
    }

    ul,
    ol {
        margin: 0.5em 0;
        padding-left: 2em;
    }

    ul ul,
    ul ol,
    ol ul,
    ol ol {
        margin: 0.25em 0;
        padding-left: 1.5em;
    }

    li {
        margin: 0.25em 0;
    }

    code {
        background-color: #f5f5f5;
        padding: 0.1em 0.3em;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
    }

    pre {
        background-color: #f8f8f8;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
        margin: 0.5em 0;

        code {
            background: none;
            padding: 0;
            border-radius: 0;
        }
    }

    blockquote {
        border-left: 4px solid #ddd;
        margin: 1em 0;
        padding-left: 1em;
        color: #666;
    }

    a {
        color: #007bff;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    strong {
        font-weight: 600;
    }

    em {
        font-style: italic;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.5em 0;

        th,
        td {
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
        }

        th {
            background-color: #f5f5f5;
            font-weight: 600;
        }
    }
}
</style>
