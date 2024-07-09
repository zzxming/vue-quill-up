import '@vue/runtime-core';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    QuillUp: (typeof import('./packages/vue-quill-up'))['default'];
  }
}
