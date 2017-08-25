'use strict';

// Shortcut notation of order_by,
// e.g. [{ attrName: 'attr', order: 'asc'}, {attrName: 'attrb', order: 'desc' }]
// -> 'attr,attrb-'
const minifyOrderBy = function (token) {
  if (!token.orderBy) { return token; }
  const orderBy = token.orderBy
    .map(({ attrName, order }) => `${attrName}${order === 'asc' ? '' : '-'}`)
    .join(',');
  return { ...token, orderBy };
};

const unminifyOrderBy = function (token) {
  if (!token.orderBy) { return token; }
  const orderBy = token.orderBy
    .split(',')
    .map(orderStr => {
      const isDesc = orderStr[orderStr.length - 1] === '-';
      const attrName = isDesc ? orderStr.slice(0, -1) : orderStr;
      const order = isDesc ? 'desc' : 'asc';
      return { attrName, order };
    });
  return { ...token, orderBy };
};

module.exports = {
  minifyOrderBy,
  unminifyOrderBy,
};
