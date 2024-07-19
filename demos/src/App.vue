<!-- eslint-disable unused-imports/no-unused-vars -->
<script setup lang="ts">
import 'vue-quill-up/theme/src/index.less';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import { ref, watch } from 'vue';
import Quill, { Delta } from 'quill/core';
import QuillUp, { QuillUpInstance } from 'vue-quill-up';
import { TextCounter } from './modules/text-counter';
import { DividerFormat } from './formats/divider';
import { MarginBottomStyle, MarginTopStyle } from './formats/margin';

const toolbarRef = ref<HTMLElement>();
const editorRef = ref<QuillUpInstance>();
const content = ref(
  new Delta([
    {
      insert: 'qwfqw',
    },
    {
      attributes: {
        'text-indent': '0em',
        'margin-top': '2em',
        'margin-bottom': '2em',
        'line-height': '1em',
      },
      insert: '\n',
    },
    {
      insert: '\n',
    },
    {
      insert: {
        divider: {
          type: 'line',
          tip: '',
        },
      },
    },
    {
      attributes: {
        color: 'rgb(171, 200, 195)',
      },
      insert: 'wfqwf',
    },
    {
      insert: '\n',
    },
  ]),
  // '<p>Hello</p><ul><li>item 1</li><li>item 2</li></ul><h2>Header</h2>',
);
const contentType = ref('delta' as const);
const readonly = ref(false);
const register = {
  modules: {
    TextCounter,
  },
  formats: {
    'divider': {
      module: DividerFormat,
      overwrite: true,
    },
    'margin-top': MarginTopStyle,
    'margin-bottom': MarginBottomStyle,
  },
  attributors: {
    style: {
      'margin-top': MarginTopStyle,
      'margin-bottom': MarginBottomStyle,
    },
  },
};

const toolbarList = [
  [{ value: '', name: 'clean', tip: '清除文本格式' }],
  [
    { value: '', name: 'bold', tip: '加粗' },
    { value: '', name: 'italic', tip: '倾斜' },
    { value: '', name: 'underline', tip: '下划线' },
    { value: '', name: 'strike', tip: '删除线' },
    { value: 'sub', name: 'script', tip: '上标' },
    { value: 'super', name: 'script', tip: '下标' },
  ],
  [
    { value: '', name: 'link', tip: '链接' },
    { value: [], name: 'size', tip: '字体大小' },
    {
      value: ['', 1, 2, 3, 4, 5, 6, 'order-border', 'tb-between-color'],
      name: 'header',
      tip: '标题',
    },
  ],
  [
    { value: [], name: 'color', tip: '字体颜色' },
    { value: [], name: 'background', tip: '背景颜色' },
  ],
  [
    { value: '', name: 'align', tip: '左对齐' },
    { value: 'center', name: 'align', tip: '居中对齐' },
    { value: 'right', name: 'align', tip: '右对齐' },
    { value: 'justify', name: 'align', tip: '两端对齐' },
  ],
  [

    { value: '', name: 'blockquote', tip: '引用' },
    // { value: '', name: 'code-block', tip: '代码块' },
  ],
  [
    { value: 'ordered', name: 'list', tip: '有序列表' },
    { value: 'bullet', name: 'list', tip: '无须列表' },
    { value: 'check', name: 'list', tip: '待办事项' },
  ],
  [
    { value: '-1', name: 'indent', tip: '减少缩进' },
    { value: '+1', name: 'indent', tip: '增加缩进' },
  ],
  [
    { value: '', name: 'image', tip: '图片' },
    { value: '', name: 'video', tip: '视频' },

  ],
];

const options = {
  theme: 'snow',
  modules: {
    toolbar: {
      container: toolbarRef,
    },
    TextCounter: {
      maxLength: 10,
      exceed: () => {
        console.log('out of range');
      },
    },
  },
};

watch(content, () => {
  console.log('watch', content.value);
}, { deep: true });

const getQuill = () => {
  if (!editorRef.value) return null;
  return editorRef.value.getQuill();
};
const test = () => {
  const quill = getQuill();
  console.log(quill);
  if (quill) {
    quill.formatLine(0, 5, {
      'margin-top': '2em',
      'margin-bottom': '2em',
    }, Quill.sources.USER);
  }
};
const getContent = () => {
  const quill = getQuill();
  if (!quill) return;
  console.log(quill.getContents());
  console.log(content.value);
};
</script>

<template>
  <main>
    <button @click="test">
      some
    </button>
    <button @click="getContent">
      getcontetn
    </button>
    <button @click="readonly = !readonly">
      break
    </button>

    <div id="tool" />
    <div ref="toolbarRef">
      <template v-for="(tools, i) in toolbarList" :key="i">
        <span class="ql-formats">
          <template v-for="tool in tools" :key="tool.name">
            <button
              v-if="typeof tool.value === 'string'"
              :class="`ql-${tool.name}`"
              :data-tip="tool.tip"
              :value="tool.value || undefined"
            />
            <select
              v-else
              :class="`ql-${tool.name}`"
              :data-tip="tool.tip"
            >
              <option
                v-for="v in tool.value"
                :key="v"
                :value="v"
              />
            </select>
          </template>
        </span>
      </template>
    </div>
    <QuillUp
      ref="editorRef"
      v-model="content"
      :options="options"
      :content-type="contentType"
      :readonly="readonly"
      :register="register"
      @focus="() => { console.log('focus') }"
      @blur="() => { console.log('blur') }"
      @text-change="() => { console.log('text-change') }"
      @selection-change="() => { console.log('selection-change') }"
      @editor-change="() => { console.log('editor-change') }"
      @ready-change="() => { console.log('ready-change') }"
    />
  </main>
</template>

<style>
.ql-editor .ql-divider {
    width: 90%;
    position: relative;
    margin: auto;
    display: flex;
    height: 1rem;
    cursor: default;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-wrap: nowrap;
    line-height: 1;
}
.ql-editor .ql-divider::after,
.ql-editor .ql-divider::before {
  content: '';
  display: block;
  flex-grow: 1;
  min-width: 1rem;
  height: 1px;
  background-color: currentColor;
}
</style>
