<script setup lang="ts">
import { computed } from 'vue';
import { useChatStore, useSideBarStore } from '../../stores';
import { NButton, NIcon, NTooltip } from 'naive-ui';
import { ArrowMinimize16Filled } from '@vicons/fluent';
import BaiduPNG from '../../assets/baidu.png';
import NewMsgSVG from '../../assets/newMsg.svg';
import EmptySVG from '../../assets/empty.svg';

const chatStore = useChatStore();
const sideBarStore = useSideBarStore();

const sideBarFixed = computed(() => sideBarStore.sideBarFixed);
const groupedConversations = computed(() => chatStore.groupedConversations);
const currentConversation = computed(() => chatStore.currentConversation);

const createNewConversation = () => {
    chatStore.createConversation();
};

const selectConversation = (id: string) => {
    chatStore.selectConversation(id);
};

const deleteConversation = (id: string) => {
    chatStore.deleteConversation(id);
};
</script>

<template>
    <div
        class="side-bar-container"
        :class="{ 'side-bar-container--float': !sideBarFixed }"
    >
        <div class="side-bar-container__header">
            <img
                class="side-bar-container__header-logo"
                :src="BaiduPNG"
                alt="baidu logo"
            />
            <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                    <n-button
                        quaternary
                        style="padding: 0 8px"
                        @click="sideBarStore.toggleSidebar"
                    >
                        <template #icon>
                            <n-icon><ArrowMinimize16Filled /></n-icon>
                        </template>
                    </n-button>
                </template>
                {{ sideBarFixed ? '收起侧栏' : '固定侧栏' }}
            </n-tooltip>
        </div>
        <div class="side-bar-container__tools">
            <n-button type="primary" style="width: 100%">
                <img
                    class="side-bar-container__tools-img"
                    :src="NewMsgSVG"
                    alt="new msg"
                />
                一段新的旅途
            </n-button>
        </div>
        <div class="side-bar-container__history">
            <!-- 空状态 -->
            <div
                v-if="Object.keys(groupedConversations).length === 0"
                class="side-bar-container__history--empty"
            >
                <img
                    class="side-bar-container__history--empty-img"
                    :src="EmptySVG"
                    alt="empty"
                />
                <p>暂无对话历史</p>
            </div>
            <!-- 历史对话 -->
            <div
                v-for="(conversations, date) in groupedConversations"
                :key="date"
                class="side-bar-container__history-group"
            >
                <div class="side-bar-container__history-group-date">
                    {{ date }}
                </div>
                <div
                    v-for="conversation in conversations"
                    :key="conversation.id"
                    class="side-bar-container__history-group-item"
                    :class="{
                        active: currentConversation?.id === conversation.id,
                    }"
                    @click="selectConversation(conversation.id)"
                >
                    <div class="side-bar-container__history-group-item-text">
                        {{ conversation.title }}
                    </div>
                    <div
                        class="side-bar-container__history-group-item-mask"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.side-bar-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    transition: all 0.3s ease;
    background-color: #f5f5f5;

    &.side-bar-container--float {
        top: 10vh;
        left: -234px;
        height: 80vh;
        border-radius: 0 8px 8px 0;
    }

    &.side-bar-container--float:hover {
        left: 0px;
    }

    .side-bar-container__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        width: 100%;
        height: 56px;

        .side-bar-container__header-logo {
            width: 28px;
            height: 28px;
        }
    }

    .side-bar-container__tools {
        display: flex;
        align-items: center;
        width: 100%;
        height: 40px;
        padding: 0 8px;

        .side-bar-container__tools-img {
            width: 18px;
            height: 18px;
            margin-right: 10px;
        }
    }

    .side-bar-container__history {
        position: relative;
        width: 100%;
        height: calc(100% - 96px);
        padding: 0 8px;

        .side-bar-container__history--empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #6c757d;

            .side-bar-container__history--empty-img {
                width: 60px;
                height: 60px;
            }
        }

        .side-bar-container__history-group {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .side-bar-container__history-group-date {
                font-size: 12px;
                color: #6c757d;
                font-weight: 500;
                padding: 8px 12px;
            }

            .side-bar-container__history-group-item {
                position: relative;
                width: 100%;
                height: 38px;
                border-radius: 8px;
                padding: 0 12px;
                cursor: pointer;
                background-color: var(--item-bg);

                --item-bg: #f5f5f5;

                &:hover {
                    --item-bg: #e9ecef;
                }

                &.active {
                    --item-bg: #e3f2fd;
                    color: #1976d2;
                }

                .side-bar-container__history-group-item-text {
                    width: 100%;
                    height: 100%;
                    line-height: 38px;
                    overflow: hidden;
                    white-space: nowrap;
                    user-select: none;
                }

                .side-bar-container__history-group-item-mask {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 24px;
                    height: 100%;
                    --dsr-side-bg-rgb: 249, 251, 255;
                    background: linear-gradient(
                        90deg,
                        rgba(249, 251, 255, 0) 0%,
                        var(--item-bg) 50%,
                        var(--item-bg) 100%
                    );
                    border-radius: 0 8px 8px 0;
                }
            }
        }
    }
}
</style>
