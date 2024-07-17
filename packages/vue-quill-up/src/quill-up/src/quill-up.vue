<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import Quill from 'quill';
import type { EmitterSource, QuillOptions, Range } from 'quill';
import { Delta, Parchment } from 'quill/core';
import { EDITOR_CHANGE_EVENT, READY_EVENT, SELECTION_CHANGE_EVENT, TEXT_CHANGE_EVENT, UPDATE_MODEL_EVENT } from './constants';
import 'quill/dist/quill.snow.css';

type QuillContentType = 'html' | 'text' | 'delta';
type AnyClass = new (...args: any[]) => any;
type QuillModule = {
  name: string;
  module: AnyClass | Parchment.Attributor;
  overwrite?: boolean;
};
type QuillRegister = {
  modules?: QuillModule[];
  formats?: QuillModule[];
  attributors?: QuillModule[];
};
const props = withDefaults(
  defineProps<{
    modelValue: string | Delta;
    options?: QuillOptions;
    contentType?: QuillContentType;
    readonly?: boolean;
    register?: QuillRegister;
  }>(),
  {
    contentType: 'delta',
    optison: () => ({}),
    readonly: false,
  },
);
const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'update:modelValue', val: string | Delta): void;
  (e: 'text-change', delta: Delta, oldDelta: Delta, source: EmitterSource): void;
  (e: 'selection-change', range: Range, oldRange: Range, source: EmitterSource): void;
  (e: 'editor-change', name: typeof TEXT_CHANGE_EVENT | typeof SELECTION_CHANGE_EVENT, value: Delta | Range, oldValue: Delta | Range, source: EmitterSource): void;
  (e: 'focus', evnet: FocusEvent): void;
  (e: 'blur', evnet: FocusEvent): void;
}>();
let quill: Quill;

const container = ref<HTMLDivElement>();
const __modelValue = ref<string | Delta>(new Delta());
const model = computed<string | Delta>({
  get() {
    return props.modelValue || __modelValue.value;
  },
  set(value: any) {
    __modelValue.value = value;
    emit(UPDATE_MODEL_EVENT, value);
  },
});

const registeDependencies = (name: string, module: any, overwrite: boolean = true) => {
  Quill.register(name, module, overwrite);
};
const resolveQuillOptions = () => {
  for (const [key, value] of Object.entries(props.register || [])) {
    for (const { name, module, overwrite = true } of value) {
      registeDependencies(`${key}/${name}`, module, overwrite);
    }
  }
  return {
    ...props.options,
    readOnly: props.readonly,
  };
};
const getQuill = () => {
  if (quill) return quill;
  return null;
};
const getContentByType = (type: QuillContentType): string | Delta => {
  const map = {
    delta: 'getContents',
    html: 'getSemanticHTML',
    text: 'getText',
  } as const;
  return quill[map[type]]();
};
const isSameContent = (value: string | Delta) => {
  const content = getContentByType(props.contentType);
  if (['text', 'html'].includes(props.contentType)) {
    return value === content;
  }
  else {
    const diffDelta = (content as Delta).diff(value as Delta);
    return !diffDelta.ops.some(d => !d.retain || Object.keys(d).length !== 1);
  }
};
const setModelValueToQuill = () => {
  if (!quill || isSameContent(model.value)) return;
  const map = {
    delta: {
      method: 'setContents',
      value: model.value,
    },
    html: {
      method: 'setContents',
      value: quill.clipboard.convert({ html: String(model.value) }),
    },
    text: {
      method: 'setText',
      value: model.value,
    },
  } as const;
  const range = quill.getSelection();
  const { method, value } = map[props.contentType];
  quill[method](value as Delta & string);

  quill.setSelection(range);
};
const updateContent = () => {
  emit(UPDATE_MODEL_EVENT, getContentByType(props.contentType));
};
const bindEvents = () => {
  quill.on(TEXT_CHANGE_EVENT, (delta, oldDelta, source) => {
    emit(TEXT_CHANGE_EVENT, delta, oldDelta, source);
  });
  quill.on(SELECTION_CHANGE_EVENT, (range, oldRange, source) => {
    emit(SELECTION_CHANGE_EVENT, range, oldRange, source);
  });
  quill.on(EDITOR_CHANGE_EVENT, (type, value, oldValue, source) => {
    if (type === TEXT_CHANGE_EVENT) {
      updateContent();
    }
    emit(EDITOR_CHANGE_EVENT, type, value, oldValue, source);
  });
  quill.root.addEventListener('focus', (e) => {
    emit('focus', e);
  });
  quill.root.addEventListener('blur', (e) => {
    emit('blur', e);
  });
};
const initialize = () => {
  if (container.value) {
    quill = new Quill(container.value, resolveQuillOptions());
    emit(READY_EVENT);
    if (!props.modelValue) {
      model.value = props.contentType === 'delta' ? new Delta() : '';
      emit(UPDATE_MODEL_EVENT, model.value);
    }
    setModelValueToQuill();
    bindEvents();
  }
};

onMounted(() => {
  initialize();
});

watch(
  () => props.modelValue,
  () => {
    setModelValueToQuill();
  },
  { immediate: true },
);
watch(() => props.readonly, () => {
  quill.enable(!props.readonly);
});

defineExpose({
  getQuill,
});
</script>

<template>
  <div ref="container" />
</template>
