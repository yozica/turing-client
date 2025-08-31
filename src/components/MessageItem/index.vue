<script setup lang="ts">
import type { Message } from "../../stores";
import { NSpin, NModal } from "naive-ui";
import { computed, ref } from "vue";
import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
// 可以选择你喜欢的主题
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
// 使用主题
VMdPreview.use(githubTheme);

const props = defineProps<{
    message: Message;
    isLoading: boolean;
    loadingTitle: string;
    loadingRagNum: number;
}>();

// 图标映射
const iconMap = {
    baidu: "https://www.baidu.com/favicon.ico",
    xhs: "https://s1.aigei.com/src/img/png/ac/acf1db67ec814ae0840d0a5a94dcd1d8.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:dEv1-PWwS4ddXA0thwN7fLqxvWI=",
    dianping:
        "https://play-lh.googleusercontent.com/dIqb1UE5hB90PyJj4nVWahcUz6X7LEb4whV0GBvsCIAiPjU9WfPzqLYBcerkN7emUw=w480-h960-rw",
    kimi: "https://s1.chu0.com/src/img/png/d2/d2aa6760531240389f7d932a4b4ba854.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=1srnZGLKZ0Aqlz6dk7yF4SkiYf4eP-YrEOdM1sob:uLhcaHt45hHAHKSpzRuEDB1FBDo=",
    map: "https://s1.aigei.com/src/img/png/a7/a7c917edc88643a2817917b6d338dc27.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:eBgLptCd3PEvpzHcjse-6zXOikA=",
} as { [key: string]: string };

const sourceNames = {
    baidu: "百度搜索",
    xhs: "小红书",
    dianping: "大众点评",
    kimi: "其它文档",
    map: "地图信息",
} as { [key: string]: string };

const content = computed(() => props.message.content ?? []);
const docs = computed(() => props.message.docs ?? []);
const sources = computed(() => props.message.sources ?? []);
const maps = computed(() => props.message.maps);

// 对话框相关状态
const showDialog = ref(false);
const currentDoc = ref<{
    type: string;
    title: string;
    doc: string;
    icon: string;
} | null>(null);

// 打开对话框
const openDialog = (item: any) => {
    currentDoc.value = item;
    showDialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
    showDialog.value = false;
    currentDoc.value = null;
};

const documents = computed(() => {
    const arr = [];
    const kimis = [];
    for (let i = 0; i < docs.value.length; i++) {
        const type = sources.value[i];
        const item = {
            type: type,
            title: sourceNames[type] ?? "",
            doc: docs.value[i],
            icon: iconMap[type] ?? "",
        };
        if (type === "kimi") {
            kimis.push(item);
        } else {
            arr.push(item);
        }
    }
    return arr.concat(kimis);
});
</script>

<template>
    <div
        class="message-item-container"
        :class="{ 'message-item-container--user': message.role === 'user' }"
        v-if="message.role !== 'system'"
    >
        <div class="message-item-container__loading" v-if="props.isLoading">
            <n-spin size="small" />
            <span class="message-item-container__loading-text">
                {{ loadingTitle }}
            </span>
        </div>
        <div
            v-if="props.isLoading && loadingRagNum !== 0"
            class="message-item-container__rag-num"
        >
            已检索到 {{ loadingRagNum }} 个相关文档
        </div>
        <div class="message-item-container__content">
            <template v-if="props.message.role === 'assistant' && content">
                <v-md-preview :text="content"></v-md-preview>
            </template>
            <template v-else>
                {{ content }}
            </template>
        </div>
        <div class="message-item-container__docs" v-if="documents.length > 0">
            <div
                class="message-item-container__docs-item"
                v-for="item in documents"
                @click="openDialog(item)"
            >
                <img :src="item.icon" />
                <p>{{ item.doc }}</p>
            </div>
        </div>
    </div>

    <!-- 文档详情对话框 -->
    <n-modal
        v-model:show="showDialog"
        preset="dialog"
        :show-icon="false"
        style="width: 600px; max-width: 90vw"
    >
        <div class="doc-dialog">
            <div class="doc-dialog__header">
                <img :src="currentDoc?.icon" class="doc-dialog__icon" />
                <span class="doc-dialog__title">{{ currentDoc?.title }}</span>
            </div>
            <div class="doc-dialog__content">
                <v-md-preview :text="currentDoc?.doc"></v-md-preview>
            </div>
        </div>
    </n-modal>
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

.message-item-container__rag-num {
    margin-left: 36px;
    font-size: 12px;
    color: #777;
}

.message-item-container__docs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
    padding: 10px;
    background: #f9fafb;
    border-radius: 10px;

    .message-item-container__docs-item {
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 8px;
        background: white;
        border: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s;
        font-size: 14px;

        &:hover {
            background: #f3f4f6;
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        > img {
            width: 20px;
            height: 20px;
        }

        > p {
            max-width: 268px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

// 对话框样式
.doc-dialog {
    &__header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
    }

    &__icon {
        width: 24px;
        height: 24px;
    }

    &__title {
        font-weight: 600;
        font-size: 16px;
        color: #1f2937;
    }

    &__content {
        max-height: 400px;
        overflow-y: auto;

        p {
            margin: 0;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
            word-break: break-word;
        }
    }

    :deep() .github-markdown-body {
        padding: 0 !important;
    }
}
</style>
