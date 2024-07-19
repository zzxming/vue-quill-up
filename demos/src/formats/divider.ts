import { Parchment } from 'quill/core';
import { isObject } from '@vue/shared';

export class DividerFormat extends Parchment.EmbedBlot {
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
