import type { App, Plugin } from 'vue';
import QuillUp from './src/quill-up.vue';

const QuillUpWithInstall = QuillUp;
QuillUpWithInstall.install = (app: App): void => {
  app.component('QuillUp', QuillUp);
};
export default QuillUpWithInstall as typeof QuillUp & Plugin;
export type QuillUpInstance = InstanceType<typeof QuillUp>;
