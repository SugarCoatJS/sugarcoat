// vim: set tw=99 ts=2 sw=2 et:

'use strict';

const bundle = resources => {
  return {
    rules: resources.flatMap(({ name, patterns }) =>
      patterns.map(pattern => `${pattern}$script,important,redirect=${name}`)
    ),
    resources: resources.map(({ name, src }) => ({
      name,
      aliases: [],
      kind: {
        mime: 'application/javascript',
      },
      content: Buffer.from(src, 'utf8').toString('base64'),
    })),
  };
};

module.exports = bundle;
