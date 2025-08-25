import type { Message } from '../stores/modules/chat';

export interface DeepSeekResponseChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
}

export class DeepSeekApiService {
    private static readonly API_URL =
        import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    private static readonly API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

    /**
     * 使用SSE流式发送消息到DeepSeek API
     * @param messages 对话消息历史
     * @param onChunk 处理每个数据块的回调函数
     * @param onComplete 完成时的回调函数
     * @param onError 错误处理回调函数
     */
    static async sendMessageStream(
        messages: Message[],
        onChunk: (content: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<void> {
        if (!this.API_KEY) {
            throw new Error(
                'DeepSeek API密钥未配置，请在.env文件中设置VITE_DEEPSEEK_API_KEY'
            );
        }

        // 转换消息格式为DeepSeek API要求的格式
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: formattedMessages,
                    stream: true,
                    temperature: 1.0,
                    max_tokens: 2000,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `API请求失败: ${response.status} ${response.statusText} - ${
                        errorData.error?.message || '未知错误'
                    }`
                );
            }

            if (!response.body) {
                throw new Error('响应体为空');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]')
                        continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonData = trimmedLine.slice(6);
                            const data: DeepSeekResponseChunk =
                                JSON.parse(jsonData);

                            if (data.choices && data.choices.length > 0) {
                                const content = data.choices[0].delta.content;
                                if (content) {
                                    onChunk(content);
                                }
                            }
                        } catch (e) {
                            console.warn('解析SSE数据失败:', e, trimmedLine);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('DeepSeek API调用失败:', error);
            onError(error instanceof Error ? error : new Error('未知错误'));
        }
    }

    /**
     * 检查API密钥是否配置
     */
    static isApiKeyConfigured(): boolean {
        return !!this.API_KEY && this.API_KEY !== 'your_deepseek_api_key_here';
    }
}
