import type { Message } from "../stores/modules/chat";

export interface TuringResponse {
    type: string;
    content: string;
    use_rag?: boolean;
    use_map?: boolean;
    doc_count?: number;
    rag_docs?: string[];
    rag_sources?: string[];
    map_info?: any;
}

const StatusMap = {
    query_classified: "正在思考中...",
    rag_retrieval_start: "正在检索相关文档...",
    map_processing_start: "正在处理地图信息...",
    response_generation_start: "正在总结信息...",
} as const;

type MessageStatus = (typeof StatusMap)[keyof typeof StatusMap];

export class TuringApiService {
    private static readonly API_URL = "http://localhost:8000/api/query";

    /**
     * 使用流式方式发送消息到Turing API
     * @param messages 对话消息历史
     * @param onChunk 处理每个数据块的回调函数
     * @param onComplete 完成时的回调函数
     * @param onError 错误处理回调函数
     */
    static async sendMessageStream(
        messages: Message[],
        onChunk: (content: string) => void,
        onChangeStatus: (status: MessageStatus) => void,
        onRagInfo: (count: number) => void,
        onEnd: (docs: string[], scorces: string[], maps: []) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ): Promise<void> {
        try {
            // 只发送最后一条用户消息（Turing API只需要当前查询）
            const lastUserMessage = messages
                .filter((msg) => msg.role === "user")
                .pop();

            if (!lastUserMessage) {
                throw new Error("没有找到用户消息");
            }

            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: lastUserMessage.content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `API请求失败: ${response.status} ${response.statusText} - ${
                        errorData.error?.message || "未知错误"
                    }`
                );
            }

            if (!response.body) {
                throw new Error("响应体为空");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    try {
                        const data: TuringResponse = JSON.parse(trimmedLine);

                        switch (data.type) {
                            case "token":
                                // 处理文本内容
                                if (data.content) {
                                    onChunk(data.content);
                                }
                                break;
                            case "status":
                                // 处理状态更新（可选显示）
                                onChangeStatus(
                                    StatusMap[
                                        data.content as keyof typeof StatusMap
                                    ]
                                );
                                break;
                            case "rag_info":
                                // 处理RAG信息（可选显示）
                                onRagInfo(data.doc_count as number);
                                break;
                            case "map_info":
                                // 处理地图信息（可选显示）
                                console.log("地图信息:", data.content);
                                break;
                            case "end":
                                // 流式传输完成
                                onEnd(
                                    data.rag_docs ? data.rag_docs : [],
                                    data.rag_sources ? data.rag_sources : [],
                                    data.map_info ? data.map_info : []
                                );
                                break;
                        }
                    } catch (e) {
                        console.warn("解析流式数据失败:", e, trimmedLine);
                    }
                }
            }
        } catch (error) {
            console.error("Turing API调用失败:", error);
            onError(error instanceof Error ? error : new Error("未知错误"));
        }
    }

    /**
     * 检查API URL是否配置
     */
    static isApiUrlConfigured(): boolean {
        return (
            !!this.API_URL && this.API_URL !== "http://localhost:8000/api/query"
        );
    }
}
