// vim: set tw=99 ts=2 sw=2 et:

'use strict';

const { iterate } = require('iterare');
const lineColumn = require('line-column');
const sortBy = require('lodash.sortby');
const { VError } = require('verror');

const ingest = (graphs, targets) => {
  const entriesMapBySrc = new Map();
  const registerEntryBySrc = (src, entry) => {
    const entries = entriesMapBySrc.get(src);
    if (entries) {
      entries.push(entry);
    } else {
      entriesMapBySrc.set(src, [entry]);
    }
  };

  const traces = iterate(targets)
    .map(target => {
      const trace = new Map();
      registerEntryBySrc(target.src, { trace });

      if (target.alts) {
        const origSrcIndex = lineColumn(target.src);
        for (const alt of target.alts) {
          registerEntryBySrc(alt.src, {
            trace,
            srcMap: alt.srcMap,
            srcIndex: lineColumn(alt.src),
            origSrcIndex,
          });
        }
      }

      return trace;
    })
    .toArray();

  for (const graph of graphs) {
    const entriesMapByNodeKey = new Map();

    for (const [scriptNodeKey, scriptNodeAttrs] of graph.nodeEntries()) {
      if (scriptNodeAttrs['node type'] !== 'script') {
        continue;
      }

      const scriptSrc = scriptNodeAttrs['source'];
      if (scriptSrc == null) {
        continue;
      }

      const entries = entriesMapBySrc.get(scriptSrc);
      if (!entries) {
        continue;
      }

      entriesMapByNodeKey.set(scriptNodeKey, entries);
    }

    for (const [bindingNodeKey, bindingNodeAttrs] of graph.nodeEntries()) {
      if (bindingNodeAttrs['node type'] !== 'binding') {
        continue;
      }

      const binding = bindingNodeAttrs['binding'];

      for (const [
        bindingEdgeKey,
        bindingEdgeAttrs,
        bindingEventNodeKey,
        ,
        bindingEventNodeAttrs,
      ] of graph.inEdgeEntries(bindingNodeKey)) {
        if (bindingEdgeAttrs['edge type'] !== 'binding') {
          continue;
        }

        for (const [
          bindingEventEdgeKey,
          bindingEventEdgeAttrs,
          scriptNodeKey,
          ,
          scriptNodeAttrs,
        ] of graph.inEdgeEntries(bindingEventNodeKey)) {
          const entries = entriesMapByNodeKey.get(scriptNodeKey);
          if (!entries) {
            continue;
          }

          const rawPosition = bindingEventEdgeAttrs['script position'];
          for (const entry of entries) {
            let position = rawPosition;
            if (entry.srcMap) {
              position = entry.srcIndex.fromIndex(position);
              position = srcMap.originalPositionFor({
                line: position.line,
                column: position.col - 1,
              });
              if (!position.source) {
                // Ignore accesses from within generated code.
                continue;
              }
              position = entry.origSrcIndex.toIndex(position.line, position.column + 1);
            }

            const bindingSet = entry.trace.get(position);
            if (bindingSet) {
              bindingSet.add(binding);
            } else {
              entry.trace.set(position, new Set([binding]));
            }
          }

          break;
        }
      }
    }
  }

  return traces.map(trace =>
    sortBy(
      iterate(trace)
        .map(([position, bindingSet]) =>
          iterate(bindingSet).map(binding => ({ binding, position }))
        )
        .flatten()
        .toArray(),
      ['position', 'binding']
    )
  );
};

module.exports = ingest;
