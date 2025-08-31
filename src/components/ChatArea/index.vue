<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { useChatStore, useSideBarStore } from "../../stores";
import { NInput, NButton, NIcon } from "naive-ui";
import { Send24Filled } from "@vicons/fluent";
import MessageList from "../MessageList/index.vue";
import { TuringApiService } from "../../services/turingApi";

const chatStore = useChatStore();
const sideBarStore = useSideBarStore();

const sideBarFixed = computed(() => sideBarStore.sideBarFixed);
const inputMessage = ref("");
const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);
const isLoading = ref(false);
const loadingTitle = ref("正在思考中...");
const loadingMessageId = ref<string | undefined>();
const loadingRagNum = ref(0);

const currentConversation = computed(() => chatStore.currentConversation);

// 当前对话没有记录时，输入框在中间
const isInputCentered = computed(() => {
    return (
        !currentConversation.value ||
        currentConversation.value.messages.length <= 1
    );
});

// 发送消息
const sendMessage = async () => {
    if (!inputMessage.value.trim() || isLoading.value) return;

    const message = inputMessage.value.trim();
    inputMessage.value = "";

    // 添加用户消息
    chatStore.addMessage(message, "user");

    // 设置loading状态
    isLoading.value = true;

    // 创建AI消息占位符（先不添加到消息历史中）
    const aiMessageId = Date.now().toString() + "-ai";
    loadingMessageId.value = aiMessageId;
    chatStore.addMessage("", "assistant", aiMessageId);

    try {
        // 调用Turing API（流式），不包含占位符消息
        const messagesToSend = (
            currentConversation.value?.messages || []
        ).filter((msg) => msg.id !== aiMessageId);
        await TuringApiService.sendMessageStream(
            messagesToSend,
            (contentChunk) => {
                // 更新AI消息内容（流式追加）
                if (currentConversation.value) {
                    const aiMessage = currentConversation.value.messages.find(
                        (msg) => msg.id === aiMessageId
                    );
                    if (aiMessage) {
                        // 如果消息已存在，则追加内容
                        aiMessage.content += contentChunk;
                        // 触发响应式更新
                        currentConversation.value.messages = [
                            ...currentConversation.value.messages,
                        ];
                    }
                }
                scrollToBottom();
            },
            (onChangeStatus) => {
                loadingTitle.value = onChangeStatus;
            },
            (count) => {
                loadingRagNum.value = count;
            },
            (docs, sources, maps) => {
                if (!currentConversation.value) return;
                const aiMessage = currentConversation.value.messages.find(
                    (msg) => msg.id === aiMessageId
                );
                if (aiMessage) {
                    aiMessage.docs = docs;
                    aiMessage.sources = sources;
                    aiMessage.maps = maps;
                }
            },
            () => {
                // 流式响应完成
                isLoading.value = false;
                loadingTitle.value = "正在思考中...";
                loadingRagNum.value = 0;
                loadingMessageId.value = undefined;
                // 保存最终的消息内容到存储
                chatStore.saveToStorage();
                scrollToBottom();
            },
            (error) => {
                // 错误处理
                console.error("发送消息失败:", error);
                if (currentConversation.value) {
                    const aiMessage = currentConversation.value.messages.find(
                        (msg) => msg.id === aiMessageId
                    );
                    if (aiMessage) {
                        aiMessage.content = `抱歉，内容生成失败：${error.message}`;
                        currentConversation.value.messages = [
                            ...currentConversation.value.messages,
                        ];
                        // 保存错误消息到存储
                        chatStore.saveToStorage();
                    }
                }
                isLoading.value = false;
                loadingTitle.value = "正在思考中...";
                loadingRagNum.value = 0;
                loadingMessageId.value = undefined;
                scrollToBottom();
            }
        );
    } catch (error) {
        console.error("发送消息失败:", error);
        if (currentConversation.value) {
            const aiMessage = currentConversation.value.messages.find(
                (msg) => msg.id === aiMessageId
            );
            if (aiMessage) {
                aiMessage.content = `抱歉，内容生成失败：${
                    error instanceof Error ? error.message : "未知错误"
                }`;
                currentConversation.value.messages = [
                    ...currentConversation.value.messages,
                ];
                // 保存错误消息到存储
                chatStore.saveToStorage();
            }
        }
        isLoading.value = false;
        loadingTitle.value = "正在思考中...";
        loadingRagNum.value = 0;
        loadingMessageId.value = undefined;
        scrollToBottom();
    }
};

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messageListRef.value) {
            messageListRef.value.scrollToBottom();
        }
    });
};

// 监听消息变化，自动滚动
watch(() => currentConversation.value?.messages.length, scrollToBottom);

// 组件挂载时滚动到底部
onMounted(() => {
    scrollToBottom();
});
</script>

<template>
    <div
        class="chat-area-container"
        :style="{
            width: sideBarFixed ? 'calc(100% - 234px)' : '100%',
            marginLeft: sideBarFixed ? '234px' : '0',
        }"
    >
        <div class="chat-area-container-box">
            <div class="chat-area-container-box__header">
                {{ currentConversation?.title }}
            </div>
            <MessageList
                ref="messageListRef"
                v-if="currentConversation && currentConversation.messages"
                :messages="currentConversation.messages"
                :is-loading="isLoading"
                :loading-title="loadingTitle"
                :loading-message-id="loadingMessageId"
                :loading-rag-num="loadingRagNum"
            />
            <div
                class="chat-area-container-box__input-area"
                :class="{
                    'chat-area-container-box__input-area--center':
                        isInputCentered,
                }"
            >
                <n-input
                    v-model:value="inputMessage"
                    placeholder="向途灵发号施令！"
                    type="textarea"
                    size="small"
                    :autosize="{
                        minRows: 1,
                        maxRows: 5,
                    }"
                    :style="{
                        paddingBottom: '40px',
                    }"
                />
                <div class="chat-area-container-box__input-area-tools">
                    <div
                        class="chat-area-container-box__input-area-tools-left"
                    ></div>
                    <div
                        class="chat-area-container-box__input-area-tools-right"
                    >
                        <n-button
                            strong
                            secondary
                            type="primary"
                            size="small"
                            :loading="isLoading"
                            style="padding: 0 5px"
                            @click="sendMessage"
                        >
                            <template #icon>
                                <n-icon><Send24Filled /></n-icon>
                            </template>
                        </n-button>
                    </div>
                </div>
                <div class="chat-area-container-box__input-area-desc">
                    内容由AI生成，注意鉴别信息真伪
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.chat-area-container {
    width: 100%;
    height: 100vh;
    padding: 6px;
    transition: width 0.3s ease, margin-left 0.3s ease;

    .chat-area-container-box {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100vh - 12px);
        background: #ffffff;
        border-radius: 8px;

        .chat-area-container-box__header {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 100%;
            height: 50px;
            font-weight: 600;
        }

        .chat-area-container-box__input-area {
            margin: 0 auto;
            position: relative;
            width: 70%;
            height: fit-content;

            &.chat-area-container-box__input-area--center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .chat-area-container-box__input-area-tools {
                position: absolute;
                left: 0;
                bottom: 28px;
                width: 100%;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
            }

            .chat-area-container-box__input-area-desc {
                width: 100%;
                height: 20px;
                font-size: 12px;
                text-align: center;
                line-height: 20px;
                color: #999;
                user-select: none;
            }
        }
    }
}
</style>
