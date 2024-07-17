<!-- eslint-disable unused-imports/no-unused-vars -->
<script setup lang="ts">
import 'vue-quill-up/theme/src/index.less';
import 'quill/dist/quill.snow.css';
import { ref, watch } from 'vue';
import Quill, { Delta, Op, Parchment } from 'quill/core';
import { isObject } from '@vue/shared';
import QuillUp, { QuillUpInstance } from 'vue-quill-up';

const isNumber = (val: any) => typeof val === 'number';

type TextCounterOptions = {
  maxLength: number;
  exceed: () => any;
};
const defaultMaxLenght = 10_000;
class TextCounter {
  quill: Quill;
  container: HTMLElement;
  options: { maxLength: number; exceed: any };
  constructor(quill: Quill, options: Partial<TextCounterOptions> = {}) {
    this.quill = quill;
    this.options = this.resolveOptions(options);

    const span = document.createElement('span');
    span.classList.add('ql-text-counter');
    this.container = quill.addContainer(span);

    this.quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
      const curDelta = oldDelta.compose(new Delta(delta));
      if (this.options.maxLength && this.getDeltaLength(curDelta) > this.options.maxLength) {
        let exceedCount = this.getDeltaLength(curDelta) - this.options.maxLength;
        let realInsertCount = 0;
        let shouldInsertCount = 0;
        const newOps: Op[] = [];
        const diffOps = delta.ops;
        for (let i = diffOps.length - 1; i >= 0; i--) {
          const item = diffOps[i];
          if (item.insert && exceedCount > 0) {
            if (typeof item.insert === 'string') {
              const len = item.insert.length;
              const text = item.insert.slice(0, Math.max(0, len - exceedCount));
              newOps.unshift({
                ...item,
                insert: text,
              });
              exceedCount -= len;
              realInsertCount += text.length;
              shouldInsertCount += len;
              continue;
            }
            else {
              exceedCount -= 1;
              shouldInsertCount += 1;
              continue;
            }
          }
          newOps.unshift(item);
        }
        const range = this.quill.getSelection() || { index: 0, length: 0 };
        this.quill.setContents(oldDelta.compose(new Delta(newOps)), Quill.sources.SILENT);
        const index = range.length + range.index + realInsertCount - shouldInsertCount;
        this.quill.setSelection({ index, length: 0 }, Quill.sources.SILENT);
      }
    });
    this.quill.on(Quill.events.EDITOR_CHANGE, (name, delta, oldDelta, source) => {
      if (name === Quill.events.TEXT_CHANGE) {
        this.updateDisplay(this.getDeltaLength(this.quill.getContents()));
      }
    });
  }

  getDeltaLength(delta: Delta) {
    return delta.ops.reduce((length, elem) => {
      if (elem.delete) {
        return length;
      }
      return length + Op.length(elem);
    }, 0);
  }

  resolveOptions(options: Partial<TextCounterOptions>) {
    return {
      maxLength: isNumber(options.maxLength) ? Number(options.maxLength) : defaultMaxLenght,
      exceed: options.exceed,
    };
  }

  updateDisplay(value: number) {
    let text = `${value}`;
    if (this.options.maxLength !== 0) {
      text += `/${this.options.maxLength}`;
    }
    this.container.textContent = text;
  }
}
const config = {
  scope: Parchment.Scope.BLOCK,
};
const MarginTopClass = new Parchment.ClassAttributor('margin-top', 'ql-margin-top', config);
const MarginTopStyle = new Parchment.StyleAttributor('margin-top', 'margin-top', config);

const MarginBottomClass = new Parchment.ClassAttributor('margin-bottom', 'ql-margin-bottom', config);
const MarginBottomStyle = new Parchment.StyleAttributor('margin-bottom', 'margin-bottom', config);

class DividerFormat extends Parchment.EmbedBlot {
  static create(value) {
    let type;
    let tip = '';
    if (isObject(value)) {
      ({ type, tip } = value);
    }
    else {
      type = value;
    }
    const node = super.create() as Element;
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('data-type', type);
    node.setAttribute('data-tip', tip || '');
    return node;
  }

  get tip() {
    return (this.domNode as Element).getAttribute('data-tip') || '';
  }

  set tip(value) {
    (this.domNode as Element).setAttribute('data-tip', value);
    this.domNode.textContent = value;
  }

  formats() {
    return { [this.statics.blotName]: this.statics.formats(this.domNode) };
  }

  formatAt(index, length, name, value) {
    this.format(name, value);
  }

  static value(domNode) {
    const { type, tip } = domNode.dataset;
    return { type, tip };
  }
}
DividerFormat.tagName = 'p';
DividerFormat.className = 'ql-divider';
DividerFormat.blotName = 'divider';

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
const modules = [
  {
    name: 'TextCounter',
    module: TextCounter,
  },
];
const formats = [
  {
    name: 'divider',
    module: DividerFormat,
  },
  {
    name: 'margin-top',
    module: MarginTopStyle,
  },
  {
    name: 'margin-bottom',
    module: MarginBottomStyle,
  },
];
const attributors = [
  {
    name: 'class/margin-top',
    module: MarginTopClass,
  },
  {
    name: 'style/margin-top',
    module: MarginTopStyle,
  },
  {
    name: 'class/margin-bottom',
    module: MarginBottomClass,
  },
  {
    name: 'style/margin-bottom',
    module: MarginBottomStyle,
  },
];
const register = {
  modules,
  formats,
  attributors,
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
.ql-divider {
  width: 90%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1rem;
  margin: auto;
  overflow: hidden;
  cursor: default;
  line-height:1;
  text-wrap: nowrap;

}
.ql-divider::after,
.ql-divider::before {
  content: '';
  display: block;
  flex-grow: 1;
  min-width: 1rem;
  height: 1px;
  background-color: currentColor;
}
</style>
