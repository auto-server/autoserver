'use strict';


module.exports = Object.assign(
  {},
  require('./compile'),
  require('./main'),
  require('./test'),
  require('./parameters'),
  require('./tokenize')
);
