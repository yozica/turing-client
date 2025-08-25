<script setup lang="ts">
import { NDialogProvider, NConfigProvider, type GlobalThemeOverrides } from 'naive-ui';

// 自定义主题
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1890ff',
    primaryColorHover: '#40a9ff',
    primaryColorPressed: '#096dd9',
    primaryColorSuppl: '#40a9ff',
    
    infoColor: '#1890ff',
    infoColorHover: '#40a9ff',
    infoColorPressed: '#096dd9',
    
    successColor: '#52c41a',
    successColorHover: '#73d13d',
    successColorPressed: '#389e0d',
    
    warningColor: '#faad14',
    warningColorHover: '#ffc53d',
    warningColorPressed: '#d48806',
    
    errorColor: '#f5222d',
    errorColorHover: '#ff4d4f',
    errorColorPressed: '#cf1322',
  }
};
</script>

<template>
    <n-config-provider :theme-overrides="themeOverrides">
        <n-dialog-provider>
            <slot />
        </n-dialog-provider>
    </n-config-provider>
</template>
