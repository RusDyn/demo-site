/**
 * ESLint rule: no-trivial-wrappers
 * Prevents exported functions that are trivial pass-through wrappers.
 * 
 * A trivial wrapper is an exported function that:
 * - Has exactly one statement/expression in its body
 * - That statement is a return of a function call
 * - The call arguments match the function parameters exactly in order
 */

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow exported pass-through wrappers',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [{
      type: 'object',
      properties: {
        minStatements: {
          type: 'number',
          minimum: 1,
          default: 2,
        },
        allowDifferentCalleeName: {
          type: 'boolean',
          default: false,
        },
      },
      additionalProperties: false,
    }],
    messages: {
      trivial: 'Exported function is a trivial pass-through wrapper; re-export or inline the callee instead.',
    },
  },

  create(context) {
    const options = context.options?.[0] ?? {}
    const minStatements = typeof options.minStatements === 'number' ? options.minStatements : 2

    // Utility functions
    const isIdentifier = (node) => node && node.type === 'Identifier'
    
    const getParameterNames = (params) => {
      const names = []
      for (const param of params) {
        if (param.type === 'Identifier') {
          names.push(param.name)
        } else if (param.type === 'AssignmentPattern' && param.left?.type === 'Identifier') {
          names.push(param.left.name)
        } else if (param.type === 'RestElement' && param.argument?.type === 'Identifier') {
          names.push(param.argument.name)
        } else {
          // Complex parameter pattern - not a simple wrapper
          return null
        }
      }
      return names
    }

    const isPassThroughCall = (fnNode, callExpr) => {
      if (!callExpr || callExpr.type !== 'CallExpression') return false

      // Get function parameter names
      const paramNames = getParameterNames(fnNode.params)
      if (!paramNames) return false

      // Check if call arguments match parameters exactly
      if (callExpr.arguments.length !== paramNames.length) return false
      
      for (let i = 0; i < callExpr.arguments.length; i++) {
        const arg = callExpr.arguments[i]
        if (!isIdentifier(arg) || arg.name !== paramNames[i]) return false
      }
      
      return true
    }

    const isTrivialBody = (fnNode) => {
      // Arrow function with expression body (implicit return)
      if (fnNode.body && fnNode.body.type !== 'BlockStatement') {
        return isPassThroughCall(fnNode, fnNode.body)
      }
      
      // Block statement body
      if (!fnNode.body || fnNode.body.type !== 'BlockStatement') return false
      
      const { body } = fnNode.body
      if (body.length >= minStatements) return false
      if (body.length !== 1) return false
      
      const statement = body[0]
      if (statement.type === 'ReturnStatement') {
        return isPassThroughCall(fnNode, statement.argument)
      }
      
      return false
    }

    const isExported = (node) => {
      // Direct export: export function foo() {}
      if (node.type === 'FunctionDeclaration' && node.parent?.type === 'ExportNamedDeclaration') {
        return true
      }
      
      // Variable export: export const foo = () => {}
      if (node.type === 'VariableDeclarator') {
        const declaration = node.parent
        const exportDeclaration = declaration?.parent
        if (declaration?.type === 'VariableDeclaration' &&
            exportDeclaration?.type === 'ExportNamedDeclaration') {
          return true
        }
      }
      
      return false
    }

    const reportIfTrivial = (fnNode, reportNode) => {
      if (isTrivialBody(fnNode)) {
        context.report({
          node: reportNode ?? fnNode,
          messageId: 'trivial',
        })
      }
    }

    return {
      // export function foo(...) { return bar(...); }
      'ExportNamedDeclaration > FunctionDeclaration'(node) {
        reportIfTrivial(node, node.id ?? node)
      },

      // export const foo = (...) => bar(...);
      // export const foo = function (...) { return bar(...); }
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
        const init = node.init
        if (!init) return
        
        if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
          reportIfTrivial(init, node.id)
        }
      },
    }
  },
}

export default rule