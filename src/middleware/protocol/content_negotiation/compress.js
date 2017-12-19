'use strict';

const { addGenErrorHandler } = require('../../../error');
const { normalizeAlgo, validateAlgo } = require('../../../compress');

// Retrieve compression asked by client for the response and request payloads
const getCompress = function ({
  queryvars,
  compressResponse,
  compressRequest,
}) {
  const {
    compressResponse: compressResponseA,
    compressRequest: compressRequestA,
  } = parseCompress({ queryvars, compressResponse, compressRequest });

  const compressResponseB = getCompressResponse({ algo: compressResponseA });
  const compressRequestB = getCompressRequest({ algo: compressRequestA });

  const compressA = joinCompress({
    compressResponse: compressResponseB,
    compressRequest: compressRequestB,
  });

  return {
    compressResponse: compressResponseB,
    compressRequest: compressRequestB,
    compress: compressA,
  };
};

// ?compress query variable, Content-Encoding or Accept-Encoding HTTP header
const parseCompress = function ({
  queryvars: { compress },
  compressResponse,
  compressRequest,
}) {
  const queryvars = splitCompress({ compress });

  const compressResponseA = queryvars.compressResponse || compressResponse;
  const compressRequestA = queryvars.compressRequest || compressRequest;

  return {
    compressResponse: compressResponseA,
    compressRequest: compressRequestA,
  };
};

// Using query variable ?compress=REQUEST_COMPRESSION[,RESPONSE_COMPRESSION]
const splitCompress = function ({ compress }) {
  if (compress === undefined) { return {}; }

  const [compressResponse, compressRequest] = compress.split(',');
  return { compressResponse, compressRequest };
};

// Inverse
const joinCompress = function ({ compressResponse, compressRequest }) {
  return [compressResponse, compressRequest].join(',');
};

// Validates and adds default values
const getAlgo = function ({ algo }) {
  const algoA = normalizeAlgo({ algo });

  validateAlgo({ algo: algoA });

  return algoA;
};

const getCompressResponse = addGenErrorHandler(getAlgo, {
  message: ({ algo }) =>
    `Unsupported compression algorithm for the response: '${algo}'`,
  reason: 'RESPONSE_FORMAT',
});

const getCompressRequest = addGenErrorHandler(getAlgo, {
  message: ({ algo }) =>
    `Unsupported compression algorithm for the request payload: '${algo}'`,
  reason: 'REQUEST_FORMAT',
});

module.exports = {
  getCompress,
};
