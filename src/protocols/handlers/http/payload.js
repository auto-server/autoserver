'use strict';

const { IncomingMessage } = require('http');
const { promisify } = require('util');

const bodyParser = require('body-parser');
const { hasBody } = require('type-is');

const { memoize } = require('../../../utilities');

// Parses and serializes HTTP request payload
// Handles HTTP compression
// Max limit 100KB
// Recognizes: application/json, application/x-www-form-urlencoded,
// string, binary
const parsePayload = async function ({ specific: { req }, type }) {
  const parser = mGetParser({ type });

  // `body-parser` will fill req.body = {} even if there is no body.
  // We want to know if there is a body or not though,
  // so must keep req.body to undefined if there is none
  const body = req.body || {};
  // Parsers have side-effects, i.e. adding req.body and req._body,
  // and we do not want those side-effects
  const reqA = new IncomingMessage();
  // We have to directly assign newReq to keep its prototype
  // eslint-disable-next-line fp/no-mutating-assign
  const reqB = Object.assign(reqA, req, { body });

  await parser(reqB, null);

  const { body: bodyB } = reqB;
  const bodyC = bodyB === body ? undefined : bodyB;
  return bodyC;
};

const getParser = function ({ type }) {
  const opts = parsersOpts[type];
  const optsA = { ...opts, type: typeChecker };
  const parser = bodyParser[type](optsA);
  const parserA = promisify(parser);
  return parserA;
};

const mGetParser = memoize(getParser);

// We already cheked the MIME type ourselves
const typeChecker = () => true;

const parsersOpts = {
  json: {},
  urlencoded: { extended: true },
  text: {},
  raw: {},
};

// Check if there is a request payload
const hasPayload = function ({ specific: { req } }) {
  return hasBody(req);
};

// Retrieves payload MIME type
const getContentType = function ({ specific: { req: { headers } } }) {
  return headers['content-type'];
};

module.exports = {
  parsePayload,
  hasPayload,
  getContentType,
};
