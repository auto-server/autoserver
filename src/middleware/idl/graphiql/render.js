'use strict';


const { render } = require('mustache');
const GRAPHIQL_HTML_FILE = `${__dirname}/graphiql.mustache`;

const { EngineError } = require('../../../error');
const { readFile } = require('../../../utilities');


/*
 * Returns HTML document loading a GraphQL debugger
 * TODO: replace with graphiql-workspace
 * TODO: do not use CDN
 * TODO: do proper web app setup, not all-in-one HTML file
 *
 * @param {object} options
 * @param {string} options.endpointURL - the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * @param {string} [options.query] - the GraphQL query to pre-fill
 * @param {object|json} [options.variables] - variables to pre-fill
 * @param {string} [options.operationName] - the operationName to pre-fill
 * @param {string} [options.result] - the result of the query to pre-fill
 *
 * @returns {string} document - HTML document
 */
const renderGraphiQL = async function (input) {
  // Those must be valid JavaScript, so must JSON-stringified
  const dataToEscape = {
    endpointURL: input.endpointURL,
    query: input.query,
    variables: input.variables,
    operationName: input.operationName,
  };
  // Those must be valid HTML
  const dataNotToEscape = {};
  const data = Object.assign(escapeData(dataToEscape), dataNotToEscape);

  try {
    const htmlFile = await readFile(GRAPHIQL_HTML_FILE);
    const htmlString = render(htmlFile, data);
    return htmlString;
  } catch (innererror) {
    throw new EngineError('Could not render GraphiQL HTML document', { reason: 'GRAPHIQL_PARSING_ERROR', innererror });
  }
};


const escapeData = function (dataToEscape) {
  const data = Object.keys(dataToEscape).reduce((memo, key) => {
    memo[key] = escapeJSON(dataToEscape[key]);
    return memo;
  }, {});
  return data;
};
const escapeJSON = function (string = null) {
  return JSON.stringify(string, null, 2);
};


module.exports = {
  renderGraphiQL,
};