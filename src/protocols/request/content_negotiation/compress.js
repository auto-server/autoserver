'use strict'

const { addGenPbHandler } = require('../../../errors')
const { getAlgo, getAlgos } = require('../../../compress')

// Retrieve compression asked by client for the response and request payloads
const getCompress = function ({
  queryvars,
  compressResponse,
  compressRequest,
}) {
  const {
    compressResponse: compressResponseA,
    compressRequest: compressRequestA,
  } = parseCompress({ queryvars, compressResponse, compressRequest })

  const compressResponseB = getCompressResponse(compressResponseA)
  const compressRequestB = getCompressRequest(compressRequestA)

  const compressA = joinCompress({
    compressResponse: compressResponseB,
    compressRequest: compressRequestB,
  })

  return {
    compressResponse: compressResponseB,
    compressRequest: compressRequestB,
    compress: compressA,
  }
}

// ?compress query variable, Content-Encoding or Accept-Encoding HTTP header
const parseCompress = function ({
  queryvars: { compress },
  compressResponse,
  compressRequest,
}) {
  const queryvars = splitCompress({ compress })

  const compressResponseA = queryvars.compressResponse || compressResponse
  const compressRequestA = queryvars.compressRequest || compressRequest

  return {
    compressResponse: compressResponseA,
    compressRequest: compressRequestA,
  }
}

// Using query variable ?compress=REQUEST_COMPRESSION[,RESPONSE_COMPRESSION]
const splitCompress = function ({ compress }) {
  if (compress === undefined) { return {} }

  const [compressResponse, compressRequest] = compress.split(',')
  return { compressResponse, compressRequest }
}

// Inverse
const joinCompress = function ({ compressResponse, compressRequest }) {
  return [compressResponse.name, compressRequest.name].join(',')
}

// Validates and adds default values
const getExtra = function (algo) {
  const suggestions = getAlgos()
  return { kind: 'compress', value: [algo], suggestions }
}

const getCompressResponse = addGenPbHandler(getAlgo, {
  reason: 'RESPONSE_NEGOTIATION',
  extra: getExtra,
})

const getCompressRequest = addGenPbHandler(getAlgo, {
  reason: 'REQUEST_NEGOTIATION',
  extra: getExtra,
})

module.exports = {
  getCompress,
}
