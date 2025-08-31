<script setup lang="ts">
import type { Message } from "../../stores";
import { NSpin, NModal } from "naive-ui";
import { computed, ref, watch, onUnmounted } from "vue";
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

// 根据出行方式获取对应的图标
const getRouteIcon = (mode: string) => {
    const iconMap: Record<string, string> = {
        驾车: "🚗",
        公交: "🚌",
        步行: "🚶",
        骑行: "🚴",
    };
    return iconMap[mode] || "📍";
};

// 百度地图相关状态
const mapContainerRef = ref<HTMLElement | null>(null);
const mapInstance = ref<any>(null);
const selectedRouteIndex = ref(0);
const showFullRoute = ref(false);
const currentRouteOverlays = ref<any[]>([]); // 存储当前路线覆盖物

// 清除所有覆盖物
const clearOverlays = () => {
    if (!mapInstance.value) return;

    // 清除之前的路线覆盖物
    currentRouteOverlays.value.forEach((overlay) => {
        try {
            mapInstance.value.removeOverlay(overlay);
        } catch (error) {
            console.warn("移除覆盖物失败:", error);
        }
    });
    currentRouteOverlays.value = [];

    // 清除地图上所有覆盖物（确保彻底清理）
    mapInstance.value.clearOverlays();
};

// 初始化地图
const initMap = async () => {
    if (!maps.value || !mapContainerRef.value) return;

    try {
        if (!window.BMapGL) {
            console.error("百度地图控件加载失败");
        }

        // 销毁旧地图实例
        if (mapInstance.value) {
            mapInstance.value.destroy();
            mapInstance.value = null;
        }

        // 创建新地图实例
        mapInstance.value = new BMapGL.Map(mapContainerRef.value);

        // 设置地图中心点和缩放级别
        const centerPoint = new BMapGL.Point(
            maps.value.origin_location.lng,
            maps.value.origin_location.lat
        );
        mapInstance.value.centerAndZoom(centerPoint, 13);

        // 启用滚轮缩放
        mapInstance.value.enableScrollWheelZoom(true);

        mapInstance.value.addControl(new BMapGL.ScaleControl());
        mapInstance.value.addControl(new BMapGL.ZoomControl());
        mapInstance.value.addControl(new BMapGL.NavigationControl3D());

        // 绘制默认路线（第一条路线）
        if (maps.value.routes && maps.value.routes.length > 0) {
            drawRoute(maps.value.routes[selectedRouteIndex.value]);
        }
    } catch (error) {
        console.error("百度地图初始化失败:", error);
    }
};

// 绘制路线
const drawRoute = (route: any) => {
    if (!mapInstance.value || !maps.value) return;

    // 清除之前的路线
    clearOverlays();

    // 根据路线类型选择不同的路线规划器
    let routePlanner;
    const start = new BMapGL.Point(
        maps.value.origin_location.lng,
        maps.value.origin_location.lat
    );
    const end = new BMapGL.Point(
        maps.value.dest_location.lng,
        maps.value.dest_location.lat
    );

    if (route.mode === "驾车") {
        routePlanner = new BMapGL.DrivingRoute(mapInstance.value, {
            renderOptions: {
                map: mapInstance.value,
                autoViewport: true,
                enableDragging: true,
            },
        });
    } else if (route.mode === "公交") {
        routePlanner = new BMapGL.TransitRoute(mapInstance.value, {
            renderOptions: {
                map: mapInstance.value,
                autoViewport: true,
            },
        });
    } else if (route.mode === "步行") {
        routePlanner = new BMapGL.WalkingRoute(mapInstance.value, {
            renderOptions: {
                map: mapInstance.value,
                autoViewport: true,
            },
        });
    } else {
        // 默认使用驾车路线
        routePlanner = new BMapGL.DrivingRoute(mapInstance.value, {
            renderOptions: {
                map: mapInstance.value,
                autoViewport: true,
                enableDragging: true,
            },
        });
    }

    // 监听路线规划完成事件，存储覆盖物
    routePlanner.setSearchCompleteCallback((result) => {
        if (result) {
            // 存储路线覆盖物以便后续清除
            const plan = result.getPlan(0);
            if (plan) {
                // 获取路线覆盖物（多边形、标记等）
                const routeLine = plan.getRoute(0);
                if (routeLine) {
                    currentRouteOverlays.value.push(routeLine);
                }
            }
        }
    });

    routePlanner.search(start, end);
};

// 监听mapContainerRef是否展示
watch(
    mapContainerRef,
    (ele) => {
        if (ele) {
            initMap();
        } else if (mapInstance.value) {
            mapInstance.value.destroy();
            mapInstance.value = null;
        }
    },
    { immediate: true, deep: true }
);

// 监听选中的路线变化，重新绘制路线
watch(selectedRouteIndex, (newIndex) => {
    if (
        maps.value &&
        maps.value.routes &&
        maps.value.routes.length > newIndex
    ) {
        drawRoute(maps.value.routes[newIndex]);
    }
});

// 组件卸载时清理
onUnmounted(() => {
    if (mapInstance.value) {
        mapInstance.value.destroy();
        mapInstance.value = null;
    }
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

        <!-- 百度地图展示 -->
        <div class="message-item-container__map" v-if="maps">
            <div ref="mapContainerRef" class="map-container"></div>
            <div class="map-info" v-if="maps.routes && maps.routes.length > 0">
                <div class="map-route-info">
                    <h4>路线信息</h4>
                    <div class="map-route-info-header">
                        <div class="route-selection">
                            <label
                                v-for="(route, index) in maps.routes"
                                :key="index"
                                class="route-option"
                            >
                                <input
                                    type="radio"
                                    :value="index"
                                    v-model="selectedRouteIndex"
                                    class="route-radio"
                                />
                                <span class="route-label">{{
                                    route.mode
                                }}</span>
                            </label>
                        </div>
                        <div>
                            <p><strong>起点:</strong> {{ maps.origin }}</p>
                            <p><strong>终点:</strong> {{ maps.destination }}</p>
                        </div>
                    </div>
                    <div
                        class="route-detail"
                        v-if="maps.routes[selectedRouteIndex]"
                    >
                        <div class="route-summary">
                            <div class="route-summary-item">
                                <span class="route-icon">📍</span>
                                <div>
                                    <div class="route-value">
                                        {{
                                            maps.routes[selectedRouteIndex]
                                                .distance_km
                                        }}
                                        km
                                    </div>
                                    <div class="route-label-text">距离</div>
                                </div>
                            </div>
                            <div class="route-summary-item">
                                <span class="route-icon">⏱️</span>
                                <div>
                                    <div class="route-value">
                                        {{
                                            maps.routes[selectedRouteIndex]
                                                .duration
                                        }}
                                    </div>
                                    <div class="route-label-text">时间</div>
                                </div>
                            </div>
                            <div class="route-summary-item">
                                <span class="route-icon">{{
                                    getRouteIcon(
                                        maps.routes[selectedRouteIndex].mode
                                    )
                                }}</span>
                                <div>
                                    <div class="route-value">
                                        {{
                                            maps.routes[selectedRouteIndex].mode
                                        }}
                                    </div>
                                    <div class="route-label-text">方式</div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="route-steps"
                            v-if="maps.routes[selectedRouteIndex].steps_summary"
                        >
                            <div class="route-steps-header">
                                <h5>路线概要</h5>
                                <button
                                    class="toggle-details-btn"
                                    @click="showFullRoute = !showFullRoute"
                                >
                                    {{
                                        showFullRoute
                                            ? "收起详情"
                                            : "查看完整路线"
                                    }}
                                </button>
                            </div>
                            <div
                                v-html="
                                    maps.routes[selectedRouteIndex]
                                        .steps_summary
                                "
                            ></div>

                            <div
                                class="full-route-details"
                                v-if="
                                    showFullRoute &&
                                    maps.routes[selectedRouteIndex].full_route
                                "
                            >
                                <h6>详细路线</h6>
                                <div
                                    v-html="
                                        maps.routes[selectedRouteIndex]
                                            .full_route
                                    "
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
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

// 地图样式
.message-item-container__map {
    margin-top: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;

    .map-container {
        width: 100%;
        height: 300px;
    }

    .map-info {
        padding: 15px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;

        .map-route-info {
            h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #1f2937;
                font-weight: 600;
            }

            p {
                margin: 6px 0;
                font-size: 14px;
                color: #374151;

                strong {
                    color: #1f2937;
                    margin-right: 8px;
                }
            }

            .map-route-info-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .route-selection {
                display: flex;
                gap: 12px;
                margin: 12px 0;
                flex-wrap: wrap;

                .route-option {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: 8px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    background: white;
                    transition: all 0.2s ease;

                    &:hover {
                        border-color: #667eea;
                        background: #f8fafc;
                    }

                    .route-radio {
                        display: none;
                    }

                    .route-label {
                        font-size: 14px;
                        color: #6b7280;
                        transition: all 0.2s ease;
                    }

                    input[type="radio"]:checked ~ .route-label {
                        color: #667eea;
                        font-weight: 600;
                    }
                }

                .route-option:has(input[type="radio"]:checked) {
                    border-color: #667eea;
                    background: #f0f7ff;

                    .route-label {
                        color: #667eea;
                        font-weight: 600;
                    }
                }
            }

            .route-detail {
                margin-top: 12px;
                padding: 16px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;

                .route-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;

                    .route-summary-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #f8fafc;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;

                        .route-icon {
                            font-size: 20px;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                            border-radius: 50%;
                            border: 1px solid #e5e7eb;
                        }

                        .route-value {
                            font-size: 16px;
                            font-weight: 600;
                            color: #1f2937;
                            line-height: 1.2;
                        }

                        .route-label-text {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 2px;
                        }
                    }
                }

                .route-steps {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;

                    h5 {
                        margin: 0 0 12px 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .route-steps-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;

                        h5 {
                            margin: 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #1f2937;
                        }

                        .toggle-details-btn {
                            padding: 4px 12px;
                            border: 1px solid #e5e7eb;
                            border-radius: 16px;
                            background: white;
                            color: #667eea;
                            font-size: 12px;
                            cursor: pointer;
                            transition: all 0.2s ease;

                            &:hover {
                                background: #f0f7ff;
                                border-color: #667eea;
                            }
                        }
                    }

                    :deep(div) {
                        font-size: 13px;
                        line-height: 1.5;
                        color: #374151;

                        p {
                            margin: 8px 0;
                        }

                        strong {
                            color: #1f2937;
                        }
                    }

                    .full-route-details {
                        margin-top: 16px;
                        padding: 12px;
                        background: #f8fafc;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;

                        h6 {
                            margin: 0 0 8px 0;
                            font-size: 13px;
                            font-weight: 600;
                            color: #1f2937;
                        }

                        :deep(div) {
                            font-size: 12px;
                            line-height: 1.4;
                            color: #6b7280;

                            p {
                                margin: 6px 0;
                            }
                        }
                    }
                }

                p {
                    margin: 4px 0;
                }
            }
        }
    }
}
</style>
