// vim: set tw=99 ts=2 sw=2 et:

'use strict';

const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors');
const fs = require('fs-extra');
const jsonlint = require('jsonlint');

const configAjv = new Ajv({ jsonPointers: true });
configAjv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const configSchema = {
  type: 'object',
  properties: {
    targets: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          patterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          policy: {
            type: 'object',
            properties: {
              include: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              exclude: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    },
    graphs: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    code: {
      type: 'string',
    },
    trace: {
      type: 'string',
    },
    report: {
      type: 'string',
    },
    bundle: {
      type: 'object',
      properties: {
        rules: {
          type: 'string',
        },
        resources: {
          type: 'string',
        },
      },
      required: ['rules', 'resources'],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};
exports.configSchema = configSchema;

const validateConfigImpl = configAjv.compile(configSchema);
const validateConfig = config => {
  if (!validateConfigImpl(config)) {
    throw new TypeError(
      betterAjvErrors(configSchema, config, validateConfigImpl.errors, { indent: 2 })
    );
  }
};
exports.validateConfig = validateConfig;

const parseConfig = configSrc => {
  const config = jsonlint.parse(configSrc);
  validateConfig(config);
  return config;
};
exports.parseConfig = parseConfig;

const parseConfigFile = async configFilePath => {
  const configSrc = await fs.readFile(configFilePath, { encoding: 'utf8' });
  return parseConfig(configSrc);
};
exports.parseConfigFile = parseConfigFile;
