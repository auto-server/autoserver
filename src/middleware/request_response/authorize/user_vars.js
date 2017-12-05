'use strict';

const { uniq, pick, mapValues, intersection } = require('../../../utilities');
const { runSchemaFunc } = require('../../../functions');
const { crawlNodes } = require('../../../filter');

// Retrieve all user variables used in `coll.authorize`, and resolve their
// schema functions.
const getUserVars = function ({ authorize, userVars, mInput }) {
  // Retrieve all `attrName` recursively inside filter AST
  const attrNames = crawlNodes(authorize, ({ attrName }) => attrName);
  const userVarsNames = getPossibleUserVars({ attrNames, userVars });
  const userVarsA = pick(userVars, userVarsNames);
  const userVarsB = mapValues(
    userVarsA,
    schemaFunc => runSchemaFunc({ schemaFunc, mInput }),
  );
  return userVarsB;
};

// Only keep the `attrName` that targets a user variable
const getPossibleUserVars = function ({ attrNames, userVars }) {
  const possibleUserVars = Object.keys(userVars);
  const userVarsNames = intersection(attrNames, possibleUserVars);
  const userVarsNamesA = uniq(userVarsNames);
  return userVarsNamesA;
};

module.exports = {
  getUserVars,
};
