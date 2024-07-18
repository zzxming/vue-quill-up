# Quill2 in Vue3

```sh
npm install vue-quill-up
```

Here is a [demo](https://stackblitz.com/edit/vitejs-vite-4ykzfu?file=src%2FApp.vue) that you can edit

## Usage

### Base

You can use v-model to bind quill content. and use `content-type` specify the type of `model-value`. Although QuillUp still uses Delta internally.

```vue
<script lang="ts" setup>
import QuillUp from 'vue-quill-up';
import { ref } from 'vue';

const content = ref('<h1>Hello World!</h1>');
const editorRef = ref();
const contentType = 'html';
const options = {
  theme: 'snow',
};
</script>

<template>
  <QuillUp
    ref="editorRef"
    v-model="content"
    :options="options"
    :readonly="false"
    :content-type="contentType"
  />
</template>
```

### Register Prop

You can use the `register` prop to register custom modules.

```vue
<script setup>
import QuillUp from 'vue-quill-up';
import { ref } from 'vue';
import { Parchment } from 'quill/core';

const MarginTopClass = new Parchment.ClassAttributor('margin-top', 'ql-margin-top', {
  scope: Parchment.Scope.BLOCK,
});
const MarginTopStyle = new Parchment.StyleAttributor('margin-top', 'margin-top', {
  scope: Parchment.Scope.BLOCK,
});

const content = ref('<h1>Hello World!</h1>');
const editorRef = ref();
const contentType = 'html';
const options = {
  theme: 'snow',
};
const register = {
  attributors: [
    {
      name: 'class/margin-top',
      module: MarginTopClass,
    },
    {
      name: 'style/margin-top',
      module: MarginTopStyle,
    },
  ],
};
</script>

<template>
  <QuillUp
    ref="editorRef"
    v-model="content"
    :options="options"
    :readonly="false"
    :content-type="contentType"
    :register="register"
  />
</template>
```

### For toolbar module

You can pass a `ref<HTMLElement>` to the `toolbar` module to customize the toolbar.

```vue
<script setup>
import { ref } from 'vue';

const content = ref('');
const toolbarRef = ref();
const options = {
  theme: 'snow',
  modules: {
    toolbar: toolbarRef,
    // or like below
    // toolbar: {
    //   container: toolbarRef,
    // },
    TextCounter: {
      maxLength: 10,
      exceed: () => {
        console.log('out of range');
      },
    },
  },
};
</script>

<template>
  <div ref="toolbarRef">
    <select class="ql-size">
      <option value="small" />
      <option selected />
      <option value="large" />
      <option value="huge" />
    </select>
    <button class="ql-bold" />
  </div>
  <QuillUp
    v-model="content"
    :options="options"
    :readonly="false"
    content-type="string"
  />
</template>
```

## Props

| name        | type                            | description                                    | default   | require |
| ----------- | ------------------------------- | ---------------------------------------------- | --------- | ------- |
| modelValue  | `string \| Delt'`               | Quill content                                  | -         | `true`  |
| contentType | `'delta' \| 'string' \| 'html'` | `modelValue` type                              | `'delta'` | `false` |
| options     | `QuillOptions`                  | Quill options                                  | `{}`      | `false` |
| readonly    | `boolean`                       | Editor is readonly. Same with options.readonly | `false`   | `false` |
| register    | `QuillRegister`                 | Modules that require automatic registration    | -         | `false` |

## Events

| name             | description                              | Type                                     |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| ready            | Trigger when Quill instance create       | `() => void`                             |
| focus            | Focus in `.ql-editor`                    | `(evnet: FocusEvent) => void`            |
| focus            | Blur from `.ql-editor`                   | `(evnet: FocusEvent) => void`            |
| text-change      | Same with `quill.on('text-change')`      | Same with `quill.on('text-change')`      |
| selection-change | Same with `quill.on('selection-change')` | Same with `quill.on('selection-change')` |
| editor-change    | Same with `quill.on('editor-change')`    | Same with `quill.on('editor-change')`    |

### Types

```ts
type AnyClass = new (...args: any[]) => any;
interface QuillModule {
  name: string;
  module: AnyClass | Parchment.Attributor;
  overwrite?: boolean;
}
interface QuillRegister {
  modules?: QuillModule[];
  formats?: QuillModule[];
  attributors?: QuillModule[];
}
```
