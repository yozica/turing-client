import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

export const useChatStore = defineStore('chat', () => {
    // 当前对话
    const currentConversation = ref<Conversation | null>(null);

    // 所有对话历史
    const conversations = ref<Conversation[]>([]);

    // 从localStorage加载数据
    const loadFromStorage = () => {
        const stored = localStorage.getItem('chat-conversations');
        if (stored) {
            conversations.value = JSON.parse(stored);
        }
    };

    // 保存到localStorage
    const saveToStorage = () => {
        localStorage.setItem(
            'chat-conversations',
            JSON.stringify(conversations.value)
        );
    };

    // 按天分组的对话
    const groupedConversations = computed(() => {
        const groups: Record<string, Conversation[]> = {};

        conversations.value.forEach((conv: Conversation) => {
            const date = new Date(conv.updatedAt).toLocaleDateString('zh-CN');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(conv);
        });

        // 按时间倒序排序每个组
        Object.keys(groups).forEach(date => {
            groups[date].sort(
                (a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt
            );
        });

        return groups;
    });

    // 创建新对话
    const createConversation = () => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        conversations.value.unshift(newConversation);
        currentConversation.value = newConversation;
        saveToStorage();

        return newConversation;
    };

    // 选择对话
    const selectConversation = (id: string) => {
        const conversation = conversations.value.find(
            (c: Conversation) => c.id === id
        );
        if (conversation) {
            currentConversation.value = conversation;
        }
    };

    // 添加消息
    const addMessage = (content: string, role: 'user' | 'assistant') => {
        if (!currentConversation.value) {
            createConversation();
        }

        const message: Message = {
            id: Date.now().toString(),
            content,
            role,
            timestamp: Date.now(),
        };

        currentConversation.value!.messages.push(message);
        currentConversation.value!.updatedAt = Date.now();

        // 更新标题（如果是第一条用户消息）
        if (
            role === 'user' &&
            currentConversation.value!.messages.length === 1
        ) {
            currentConversation.value!.title =
                content.slice(0, 20) + (content.length > 20 ? '...' : '');
        }

        saveToStorage();
    };

    // 删除对话
    const deleteConversation = (id: string) => {
        const index = conversations.value.findIndex(
            (c: Conversation) => c.id === id
        );
        if (index !== -1) {
            conversations.value.splice(index, 1);
            if (currentConversation.value?.id === id) {
                currentConversation.value = null;
            }
            saveToStorage();
        }
    };

    // 重命名对话
    const renameConversation = (id: string, newTitle: string) => {
        const conversation = conversations.value.find(
            (c: Conversation) => c.id === id
        );
        if (conversation) {
            conversation.title = newTitle;
            conversation.updatedAt = Date.now();
            saveToStorage();
            
            // 如果当前选中的是这个对话，也更新当前对话的标题
            if (currentConversation.value?.id === id) {
                currentConversation.value.title = newTitle;
            }
        }
    };

    // 初始化加载数据
    loadFromStorage();

    return {
        currentConversation,
        conversations,
        groupedConversations,
        createConversation,
        selectConversation,
        addMessage,
        deleteConversation,
        renameConversation,
    };
});
