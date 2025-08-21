import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

export * from './modules/chat';
export * from './modules/sideBar';
