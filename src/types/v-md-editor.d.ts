declare module '@kangc/v-md-editor/lib/preview' {
  const VMdPreview: {
    use(theme: any): void;
  };
  export default VMdPreview;
}

declare module '@kangc/v-md-editor/lib/theme/github.js' {
  const githubTheme: any;
  export default githubTheme;
}

declare module '@kangc/v-md-editor/lib/style/preview.css' {}
declare module '@kangc/v-md-editor/lib/theme/style/github.css' {}
