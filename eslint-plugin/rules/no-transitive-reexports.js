const rule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow re-exporting previously imported bindings' },
    messages: {
      noTransitive: 'Do not re-export imported binding "{{name}}". Import where needed instead.'
    },
    schema: [{
      type: 'object',
      properties: {
        allow: { type: 'array', items: { type: 'string' } } // optional whitelist of names
      },
      additionalProperties: false
    }]
  },
  create(context) {
    const options = (context.options?.[0] || {});
    const allow = new Set(options.allow ?? []);

    const imported = new Set();

    return {
      ImportDeclaration(node) {
        for (const s of node.specifiers) {
          // local names under which imports are visible in the module
          imported.add(s.local.name);
        }
      },
      ExportNamedDeclaration(node) {
        // only interested in exports without source: export { x }
        if (node.source) return;

        for (const spec of node.specifiers) {
          const local = spec.local.name;
          if (!allow.has(local) && imported.has(local)) {
            context.report({
              node: spec,
              messageId: 'noTransitive',
              data: { name: local }
            });
          }
        }
      }
    };
  }
};

export default rule;