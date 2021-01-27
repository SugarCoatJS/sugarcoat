// vim: set tw=99 ts=2 sw=2 et:

'use strict';

const path = require('path');

const fs = require('fs-extra');
const Handlebars = require('handlebars');
const { iterate } = require('iterare');
const lineColumn = require('line-column');
const groupBy = require('lodash.groupby');
const sortBy = require('lodash.sortby');
const { VError } = require('verror');

const contextLength = 24;

const report = (reportTemplate, targets) =>
  reportTemplate({
    targets: iterate(targets).map(({ name, src, trace }) => {
      const srcIndex = lineColumn(src);
      return {
        name,
        bindings: sortBy(Object.entries(groupBy(trace, 'binding')), 0).map(([name, accesses]) => ({
          name,
          accesses: accesses.map(bindingAccess => ({
            accessPosition: srcIndex.fromIndex(bindingAccess.position),
            accessPrefix: src.substring(
              Math.max(0, bindingAccess.position - 1 - contextLength),
              bindingAccess.position - 1
            ),
            accessSuffix: src.substring(
              bindingAccess.position - 1,
              Math.min(src.length, bindingAccess.position - 1 + contextLength)
            ),
          })),
        })),
      };
    }),
  });
module.exports = report;

const loadReportTemplate = async reportTemplate =>
  Handlebars.compile(
    await fs.readFile(path.join(__dirname, 'reportTemplate.handlebars'), { encoding: 'utf8' })
  );
report.loadReportTemplate = loadReportTemplate;
