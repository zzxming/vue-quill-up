import { Parchment } from 'quill/core';

const config = {
  scope: Parchment.Scope.BLOCK,
};
export const MarginTopStyle = new Parchment.StyleAttributor('margin-top', 'margin-top', config);

export const MarginBottomStyle = new Parchment.StyleAttributor('margin-bottom', 'margin-bottom', config);
