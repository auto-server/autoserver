'use strict';

// Break down '  \\( inlineFunc )  '
// into tokens: '  ', '\', '(', ' inlineFunc ', ')', '  '
const tokenizeInlineFunc = function ({ inlineFunc }) {
  return inlineFuncRegExp.exec(inlineFunc);
};

const inlineFuncRegExp = /^(\s*)(\\?)(\()(.*)(\))(\s*)$/;
const inlineFuncIndex = 4;

// Remove outer parenthesis from inline function
const getInlineFunc = function ({ inlineFunc }) {
  const parts = tokenizeInlineFunc({ inlineFunc });
  return (parts && parts[inlineFuncIndex]) || '';
};

module.exports = {
  tokenizeInlineFunc,
  getInlineFunc,
};
