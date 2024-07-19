import Quill from 'quill';
import { Delta, Op } from 'quill/core';

const isNumber = (val: any) => typeof val === 'number';

interface TextCounterOptions {
  maxLength: number;
  exceed: () => any;
}
const defaultMaxLenght = 10_000;
export class TextCounter {
  quill: Quill;
  container: HTMLElement;
  options: { maxLength: number; exceed: any };
  constructor(quill: Quill, options: Partial<TextCounterOptions> = {}) {
    this.quill = quill;
    this.options = this.resolveOptions(options);

    const span = document.createElement('span');
    span.classList.add('ql-text-counter');
    this.container = quill.addContainer(span);

    this.quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, _source) => {
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
    this.quill.on(Quill.events.EDITOR_CHANGE, (name, _delta, _oldDelta, _source) => {
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
