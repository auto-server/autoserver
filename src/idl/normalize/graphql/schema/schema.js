'use strict';

const { GraphQLSchema } = require('graphql');
const { v4: uuidv4 } = require('uuid');

const { mapValues } = require('../../../../utilities');

const { getType } = require('./types');
const { getModelDefs } = require('./models');

// Returns GraphQL schema
const getSchema = function ({ idl, serverOpts }) {
  const topDefs = getTopDefs({ idl });
  const topTypes = getTopTypes({ topDefs, serverOpts });
  const schema = new GraphQLSchema(topTypes);
  return schema;
};

const getTopDefs = function ({ idl }) {
  return mapValues(topDefsInit, (topDef, topDefName) =>
    getGraphqlMethodDef({ topDef, topDefName, idl })
  );
};

const commonTopDefsInit = {
  kind: 'graphqlMethod',
  type: 'object',
};

const topDefsInit = {
  query: {
    ...commonTopDefsInit,
    description: 'Fetches information about different entities',
    name: 'Query',
  },
  mutation: {
    ...commonTopDefsInit,
    description: 'Modifies information about different entities',
    name: 'Mutation',
  },
};

const getGraphqlMethodDef = function ({ topDef, topDefName, idl }) {
  const attributes = getModelDefs({ graphqlMethod: topDefName, idl });

  return { ...topDef, attributes };
};

// Builds query|mutation type
const getTopTypes = function ({ topDefs, serverOpts }) {
  const schemaId = uuidv4();

  return mapValues(topDefs, topDef =>
    getType(topDef, { serverOpts, topDef, schemaId })
  );
};

module.exports = {
  getSchema,
};
