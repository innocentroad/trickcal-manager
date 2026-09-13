'use strict';

const fs = require('node:fs');
const path = require('node:path');

let acorn;
try {
  // Acorn is deliberately a tools-only dependency. It is never loaded by the
  // pages and is kept out of the Pages artifact by the workflow.
  acorn = require('acorn');
} catch (error) {
  const dependencyError = new Error(
    'storage access detection requires tools dependencies; run npm ci --prefix tools'
  );
  dependencyError.cause = error;
  throw dependencyError;
}

const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.github',
  'backups',
  'node_modules',
  'tmp',
  'tools',
  '_site'
]);

const STORAGE_METHODS = new Set(['getItem', 'setItem', 'removeItem', 'clear']);
let nextBindingId = 1;

function lineNumber(source, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (source[index] === '\n') line += 1;
  }
  return line;
}

function isNode(value) {
  return !!value && typeof value === 'object' && typeof value.type === 'string';
}

function unwrapChain(node) {
  return node?.type === 'ChainExpression' ? node.expression : node;
}

function sourceExpression(source, node) {
  if (!node || typeof node.start !== 'number' || typeof node.end !== 'number') return '';
  return source.slice(node.start, node.end).trim();
}

function parseJavaScript(source, file) {
  let scriptError;
  try {
    return acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowHashBang: true,
      locations: true
    });
  } catch (error) {
    scriptError = error;
  }

  try {
    return acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowHashBang: true,
      locations: true
    });
  } catch (moduleError) {
    const parseError = new Error(
      `${file || '<source>'} could not be parsed as JavaScript: ${moduleError.message}`
    );
    parseError.cause = scriptError;
    throw parseError;
  }
}

function isJavaScriptScriptTag(attributes) {
  const typeMatch = attributes.match(/\btype\s*=\s*(["'])(.*?)\1/i);
  if (!typeMatch) return true;
  return /(?:java|ecma)script|module/i.test(typeMatch[2]);
}

function getSourceUnits(source, file) {
  if (path.extname(file).toLowerCase() !== '.html') {
    return [{ source, offset: 0 }];
  }

  // A script-like fragment inside an HTML comment is not an executable
  // inline script. Mask the comment while preserving offsets so it cannot
  // become a false storage access or a fake script tag.
  const htmlWithoutComments = source.replace(/<!--[\s\S]*?-->/g, comment => (
    comment.replace(/[^\r\n]/g, ' ')
  ));
  const units = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = scriptPattern.exec(htmlWithoutComments))) {
    if (!isJavaScriptScriptTag(match[1])) continue;
    const body = match[2];
    const offset = match.index + match[0].indexOf(body);
    if (body.trim()) units.push({ source: body, offset });
  }
  return units;
}

function patternNames(pattern, names = []) {
  if (!pattern) return names;
  switch (pattern.type) {
    case 'Identifier':
      names.push(pattern.name);
      break;
    case 'RestElement':
      patternNames(pattern.argument, names);
      break;
    case 'AssignmentPattern':
      patternNames(pattern.left, names);
      break;
    case 'ArrayPattern':
      pattern.elements.forEach(item => patternNames(item, names));
      break;
    case 'ObjectPattern':
      pattern.properties.forEach(property => {
        if (property.type === 'RestElement') patternNames(property.argument, names);
        else patternNames(property.value || property.argument, names);
      });
      break;
    default:
      break;
  }
  return names;
}

function createScope(parent, type, node) {
  return {
    parent,
    type,
    node,
    bindings: new Map()
  };
}

function nearestFunctionScope(scope) {
  let current = scope;
  while (current && !['function', 'program'].includes(current.type)) current = current.parent;
  return current || scope;
}

function registerBinding(scope, name, kind, node, init = null) {
  if (!name) return null;
  let binding = scope.bindings.get(name);
  if (!binding) {
    binding = { id: `binding-${nextBindingId++}`, name, kind, declarations: [], mutations: [] };
    scope.bindings.set(name, binding);
  }
  binding.declarations.push({ node, init });
  return binding;
}

function findBinding(scope, name) {
  let current = scope;
  while (current) {
    if (current.bindings.has(name)) return current.bindings.get(name);
    current = current.parent;
  }
  return null;
}

function buildScopeIndex(ast) {
  const root = createScope(null, 'program', ast);
  const scopeByNode = new WeakMap();
  const functions = [];

  function visit(node, scope) {
    if (!isNode(node)) return;

    if (node.type === 'Program') {
      scopeByNode.set(node, root);
      node.body.forEach(child => visit(child, root));
      return;
    }

    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      let functionBinding = null;
      if (node.type === 'FunctionDeclaration' && node.id) {
        functionBinding = registerBinding(scope, node.id.name, 'function', node.id);
      }
      const functionScope = createScope(scope, 'function', node);
      let functionNameBinding = null;
      if (node.type !== 'FunctionDeclaration' && node.id) {
        functionNameBinding = registerBinding(functionScope, node.id.name, 'function-name', node.id);
      }
      node.params.forEach(parameter => {
        patternNames(parameter).forEach(name => registerBinding(functionScope, name, 'parameter', parameter));
      });
      scopeByNode.set(node, functionScope);
      functions.push({
        name: node.id?.name || '<anonymous>',
        params: node.params.flatMap(parameter => patternNames(parameter, [])),
        binding: functionBinding || functionNameBinding,
        node
      });
      node.params.forEach(parameter => visit(parameter, functionScope));
      visit(node.body, functionScope);
      return;
    }

    let currentScope = scope;
    if (node.type === 'BlockStatement') {
      currentScope = createScope(scope, 'block', node);
    } else if (node.type === 'CatchClause') {
      currentScope = createScope(scope, 'catch', node);
      patternNames(node.param).forEach(name => registerBinding(currentScope, name, 'catch', node.param));
    }
    scopeByNode.set(node, currentScope);

    if (node.type === 'VariableDeclaration') {
      const declarationScope = node.kind === 'var' ? nearestFunctionScope(currentScope) : currentScope;
      node.declarations.forEach(declaration => {
        patternNames(declaration.id).forEach(name => registerBinding(
          declarationScope,
          name,
          node.kind,
          declaration.id,
          declaration.init
        ));
      });
    }

    if (node.type === 'AssignmentExpression' && node.left?.type === 'Identifier') {
      findBinding(currentScope, node.left.name)?.mutations.push({
        node: node.left,
        expression: node.right,
        operator: node.operator
      });
    }
    if (node.type === 'UpdateExpression' && node.argument?.type === 'Identifier') {
      findBinding(currentScope, node.argument.name)?.mutations.push({
        node: node.argument,
        expression: null,
        operator: node.operator
      });
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) value.forEach(child => visit(child, currentScope));
      else if (isNode(value)) visit(value, currentScope);
    }
  }

  visit(ast, root);
  return { root, scopeByNode, functions };
}

function resolveStaticString(node, scope, scopeIndex, seen = new Set()) {
  node = unwrapChain(node);
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map(quasi => quasi.value.cooked ?? quasi.value.raw).join('');
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = resolveStaticString(node.left, scope, scopeIndex, seen);
    const right = resolveStaticString(node.right, scope, scopeIndex, seen);
    return left == null || right == null ? null : left + right;
  }
  if (node.type !== 'Identifier') return null;

  const binding = findBinding(scope, node.name);
  if (!binding || binding.declarations.length !== 1 || binding.mutations.length) return null;
  const declaration = binding.declarations[0];
  if (!declaration.init || seen.has(binding)) return null;
  seen.add(binding);
  const declarationScope = scopeIndex.scopeByNode.get(declaration.node) || scope;
  const resolved = resolveStaticString(declaration.init, declarationScope, scopeIndex, seen);
  seen.delete(binding);
  return resolved;
}

function propertyName(member, scope, scopeIndex) {
  if (!member?.computed) return member?.property?.type === 'Identifier' ? member.property.name : null;
  return resolveStaticString(member.property, scope, scopeIndex);
}

function resolveStorageObject(node, scope, scopeIndex, seen = new Set()) {
  node = unwrapChain(node);
  if (!node) return null;

  if (node.type === 'Identifier') {
    const binding = findBinding(scope, node.name);
    if (['localStorage', 'sessionStorage'].includes(node.name)) {
      if (binding) return { base: node.name, area: null, unresolved: 'shadowed global storage name' };
      return { base: node.name, area: node.name };
    }
    if (binding && binding.declarations.length === 1 && !seen.has(binding)) {
      const declaration = binding.declarations[0];
      if (declaration.init) {
        seen.add(binding);
        const declarationScope = scopeIndex.scopeByNode.get(declaration.node) || scope;
        const resolved = resolveStorageObject(declaration.init, declarationScope, scopeIndex, seen);
        seen.delete(binding);
        if (resolved && binding.mutations.length) {
          return {
            base: node.name,
            area: null,
            aliasOf: resolved.base,
            unresolved: 'storage alias is reassigned'
          };
        }
        if (resolved && !resolved.unresolved) {
          return { ...resolved, base: node.name, aliasOf: resolved.base };
        }
      }

      // Also recognize `let store; store = localStorage;` as a storage alias
      // whose final value cannot be proven statically.
      for (const mutation of binding.mutations) {
        if (!mutation.expression) continue;
        seen.add(binding);
        const mutationScope = scopeIndex.scopeByNode.get(mutation.node) || scope;
        const resolved = resolveStorageObject(mutation.expression, mutationScope, scopeIndex, seen);
        seen.delete(binding);
        if (resolved) {
          return {
            base: node.name,
            area: null,
            aliasOf: resolved.base,
            unresolved: 'storage alias is assigned more than once or after declaration'
          };
        }
      }
    }
    return null;
  }

  if (node.type === 'MemberExpression') {
    const object = unwrapChain(node.object);
    if (object?.type === 'MemberExpression') {
      const facadeRoot = unwrapChain(object.object);
      const facadeName = propertyName(object, scope, scopeIndex);
      const facadeArea = propertyName(node, scope, scopeIndex);
      if (facadeRoot?.type === 'Identifier'
        && ['window', 'globalThis'].includes(facadeRoot.name)
        && !findBinding(scope, facadeRoot.name)
        && facadeName === 'TRICKCAL_STORAGE_FACADE'
        && ['localStorage', 'sessionStorage'].includes(facadeArea)) {
        return {
          base: `${facadeRoot.name}.TRICKCAL_STORAGE_FACADE.${facadeArea}`,
          area: facadeArea,
          facade: true
        };
      }
    }
    if (object?.type === 'Identifier' && ['window', 'globalThis'].includes(object.name)) {
      if (findBinding(scope, object.name)) {
        return { base: `${object.name}.${propertyName(node, scope, scopeIndex) || '?'}`, area: null, unresolved: 'shadowed global object' };
      }
      const area = propertyName(node, scope, scopeIndex);
      if (area === 'localStorage' || area === 'sessionStorage') {
        return { base: `${object.name}.${area}`, area };
      }
      if (node.computed && area == null) {
        return { base: `${object.name}.[computed]`, area: null, unresolved: 'dynamic storage object property' };
      }
    }
    return null;
  }

  if (node.type === 'CallExpression') {
    const callee = unwrapChain(node.callee);
    if (callee?.type === 'Identifier' && callee.name === 'getStorage') {
      return { base: 'getStorage()', area: 'localStorage', aliasOf: 'getStorage()' };
    }
    if (callee?.type === 'Identifier' && callee.name === 'getSessionStorage') {
      return { base: 'getSessionStorage()', area: 'sessionStorage', aliasOf: 'getSessionStorage()' };
    }
  }
  return null;
}

function getMemberMethod(member, scope, scopeIndex, source) {
  const name = propertyName(member, scope, scopeIndex);
  return {
    name,
    dynamic: member?.computed && name == null,
    expression: sourceExpression(source, member?.property)
  };
}

function argumentInfo(call, source, scope, scopeIndex) {
  const first = call.arguments?.[0];
  return {
    argumentExpression: sourceExpression(source, first),
    resolvedKey: resolveStaticString(first, scope, scopeIndex)
  };
}

function functionNameForNode(node) {
  return node.id?.name || '<anonymous>';
}

function isSimpleIdentifierAlias(node, parent) {
  return (parent?.type === 'VariableDeclarator'
      && parent.init === node
      && parent.id?.type === 'Identifier')
    || (parent?.type === 'AssignmentExpression'
      && parent.right === node
      && parent.left?.type === 'Identifier');
}

function isFunctionDeclarationIdentifier(node, parent) {
  return (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(parent?.type)
    && parent.id === node);
}

function resolveFunctionBinding(node, scope, scopeIndex, seen = new Set()) {
  node = unwrapChain(node);
  if (!node || node.type !== 'Identifier') return null;
  const binding = findBinding(scope, node.name);
  if (!binding || seen.has(binding)) return null;
  if (['function', 'function-name'].includes(binding.kind)) return binding;
  if (binding.declarations.length !== 1 || binding.mutations.length) return null;
  const declaration = binding.declarations[0];
  if (!declaration.init) return null;
  if (['FunctionExpression', 'ArrowFunctionExpression'].includes(declaration.init.type)) {
    return binding;
  }
  seen.add(binding);
  const declarationScope = scopeIndex.scopeByNode.get(declaration.node) || scope;
  const resolved = resolveFunctionBinding(declaration.init, declarationScope, scopeIndex, seen);
  seen.delete(binding);
  return resolved;
}

function resolveFunctionAlias(node, scope, scopeIndex, seen = new Set()) {
  return resolveFunctionBinding(node, scope, scopeIndex, seen)?.name || null;
}

function analyzeUnit(unit, fullSource, file, analysisOptions = {}) {
  const ast = parseJavaScript(unit.source, file);
  const scopeIndex = buildScopeIndex(ast);
  scopeIndex.source = unit.source;
  const accesses = [];
  const helperCalls = [];
  const helperEscapes = [];
  const storageEscapes = [];
  const seenHelperEscapes = new Set();
  const seenStorageEscapes = new Set();
  const storageParameterBindings = new Set();
  const storageParameterDeclarationNodes = new WeakSet();

  function markPatternNodes(pattern) {
    if (!isNode(pattern)) return;
    storageParameterDeclarationNodes.add(pattern);
    for (const [key, value] of Object.entries(pattern)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) value.forEach(markPatternNodes);
      else if (isNode(value)) markPatternNodes(value);
    }
  }

  function registerDeclaredStorageParameterBindings() {
    for (const contract of analysisOptions.storageParameterContracts || []) {
      if (contract.file && contract.file !== file) continue;
      const targets = scopeIndex.functions.filter(item => item.name === contract.function);
      if (targets.length !== 1) continue;
      const targetScope = scopeIndex.scopeByNode.get(targets[0].node);
      const parameterBinding = targetScope?.bindings.get(contract.parameter);
      if (parameterBinding?.kind === 'parameter') {
        storageParameterBindings.add(parameterBinding);
        const parameterIndex = targets[0].node.params.findIndex(parameter => (
          patternNames(parameter, []).includes(contract.parameter)
        ));
        if (parameterIndex >= 0) markPatternNodes(targets[0].node.params[parameterIndex]);
      }
    }
  }

  function resolveTrackedStorageParameter(node, scope) {
    node = unwrapChain(node);
    if (node?.type !== 'Identifier') return null;
    const binding = findBinding(scope, node.name);
    if (!binding || !storageParameterBindings.has(binding)) return null;
    return {
      base: node.name,
      area: 'alias',
      helperParameter: true,
      parameterBinding: binding
    };
  }

  // A parameter is treated as a storage parameter only when a local call site
  // passes a storage object to the corresponding function argument. This keeps
  // ordinary APIs such as `values.clear()` out of the storage audit while still
  // rejecting the common `f(s) { s.clear(); } f(localStorage)` escape.
  function collectStorageParameterBindings(node, scope = scopeIndex.root) {
    if (!isNode(node)) return;
    const currentScope = scopeIndex.scopeByNode.get(node) || scope;
    if (node.type === 'CallExpression' && node.callee?.type === 'Identifier') {
      const functionBinding = resolveFunctionBinding(node.callee, currentScope, scopeIndex);
      const functionName = functionBinding?.name || null;
      const target = scopeIndex.functions.find(item => item.binding === functionBinding);
      if (target) {
        const targetScope = scopeIndex.scopeByNode.get(target.node);
        node.arguments.forEach((argument, index) => {
          if (!resolveStorageObject(argument, currentScope, scopeIndex)) return;
          const parameterNames = patternNames(target.node.params[index], []);
          parameterNames.forEach(name => {
            const binding = targetScope?.bindings.get(name);
            if (binding) {
              storageParameterBindings.add(binding);
              markPatternNodes(target.node.params[index]);
            }
          });
        });
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) value.forEach(child => collectStorageParameterBindings(child, currentScope));
      else if (isNode(value)) collectStorageParameterBindings(value, currentScope);
    }
  }

  registerDeclaredStorageParameterBindings();
  collectStorageParameterBindings(ast);

  function addStorageEscape(node, kind, details = {}) {
    const key = `${kind}:${node?.start ?? -1}:${details.argumentIndex ?? ''}:${details.expression || ''}`;
    if (seenStorageEscapes.has(key)) return;
    seenStorageEscapes.add(key);
    storageEscapes.push({
      file,
      line: lineNumber(fullSource, unit.offset + (node?.start ?? 0)),
      kind,
      expression: sourceExpression(unit.source, node),
      ...details
    });
  }

  function addHelperEscape(node, helper, kind, details = {}) {
    const key = `${kind}:${helper}:${node?.start ?? -1}:${details.expression || ''}`;
    if (seenHelperEscapes.has(key)) return;
    seenHelperEscapes.add(key);
    helperEscapes.push({
      file,
      line: lineNumber(fullSource, unit.offset + (node?.start ?? 0)),
      helper,
      kind,
      expression: sourceExpression(unit.source, node),
      ...details
    });
  }

  function visit(node, currentFunction = '<top-level>', parent = null, grandparent = null) {
    if (!isNode(node)) return;
    let functionName = currentFunction;
    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      functionName = functionNameForNode(node);
    }

    if (node.type === 'CallExpression') {
      const callee = unwrapChain(node.callee);
      if (callee?.type === 'MemberExpression') {
        const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
        const method = getMemberMethod(callee, scope, scopeIndex, unit.source);
        let storage = resolveStorageObject(callee.object, scope, scopeIndex);
        if (!storage && callee.object?.type === 'Identifier') {
          const trackedParameter = resolveTrackedStorageParameter(callee.object, scope);
          const parameterBinding = findBinding(scope, callee.object.name);
          const isStorageParameter = parameterBinding?.kind === 'parameter'
            && storageParameterBindings.has(parameterBinding)
            && (STORAGE_METHODS.has(method.name) || method.dynamic);
          if (isStorageParameter) {
            storage = trackedParameter || { base: callee.object.name, area: 'alias', helperParameter: true };
          }
        }
        if (storage) {
          const operation = STORAGE_METHODS.has(method.name)
            ? method.name
            : (method.dynamic ? 'dynamic' : 'unsupported');
          const argument = argumentInfo(node, unit.source, scope, scopeIndex);
          const absoluteStart = unit.offset + node.start;
          accesses.push({
            file,
            line: lineNumber(fullSource, absoluteStart),
            base: storage.base,
            area: storage.area,
            operation,
            optional: !!(callee.optional || node.optional || node.callee?.type === 'ChainExpression'),
            computed: !!callee.computed,
            methodExpression: method.expression,
            argumentExpression: argument.argumentExpression,
            resolvedKey: operation === 'clear' ? null : argument.resolvedKey,
            functionName,
            helperParameter: !!storage.helperParameter,
            parameterBindingId: storage.parameterBinding?.id || null,
            storageResolved: !storage.unresolved,
            storageResolution: storage.unresolved || null
          });
        }
      }

      if (callee?.type === 'Identifier') {
        const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
        const resolvedHelperBinding = resolveFunctionBinding(callee, scope, scopeIndex);
        const storageArgument = node.arguments[0];
        const storage = resolveStorageObject(storageArgument, scope, scopeIndex);
        helperCalls.push({
          file,
          line: lineNumber(fullSource, unit.offset + node.start),
          helper: callee.name,
          resolvedHelper: resolveFunctionAlias(callee, scope, scopeIndex) || callee.name,
          resolvedHelperBindingId: resolvedHelperBinding?.id || null,
          caller: functionName,
          argumentExpressions: node.arguments.map(argument => sourceExpression(unit.source, argument)),
          resolvedArguments: node.arguments.map(argument => resolveStaticString(argument, scope, scopeIndex)),
          storageArea: storage?.area || null
        });
      }

      const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
      node.arguments.forEach((argument, argumentIndex) => {
        const storage = resolveStorageObject(argument, scope, scopeIndex)
          || resolveTrackedStorageParameter(argument, scope);
        if (!storage) return;
        const calleeName = callee?.type === 'Identifier' ? callee.name : null;
        const calleeBinding = callee?.type === 'Identifier'
          ? resolveFunctionBinding(callee, scope, scopeIndex)
          : null;
        addStorageEscape(argument, 'argument', {
          argumentIndex,
          base: storage.base,
          area: storage.area,
          storageResolved: !storage.unresolved,
          storageResolution: storage.unresolved || null,
          callee: calleeName,
          resolvedCallee: calleeName
            ? (resolveFunctionAlias(callee, scope, scopeIndex) || calleeName)
            : null,
          resolvedCalleeBindingId: calleeBinding?.id || null,
          argumentExpressions: node.arguments.map(argumentNode => sourceExpression(unit.source, argumentNode)),
          resolvedArguments: node.arguments.map(argumentNode => resolveStaticString(argumentNode, scope, scopeIndex))
        });
      });

      if (callee?.type === 'MemberExpression') {
        const helper = resolveFunctionAlias(callee.object, scope, scopeIndex);
        const helperBinding = resolveFunctionBinding(callee.object, scope, scopeIndex);
        if (helper && helperBinding) {
          addHelperEscape(callee.object, helper, 'member-call', {
            caller: functionName,
            member: propertyName(callee, scope, scopeIndex) || '(computed)',
            helperBindingId: helperBinding.id
          });
        }
      }

      node.arguments.forEach(argument => {
        const resolvedHelper = resolveFunctionAlias(argument, scope, scopeIndex);
        if (!resolvedHelper) return;
        const helperBinding = resolveFunctionBinding(argument, scope, scopeIndex);
        addHelperEscape(argument, resolvedHelper, 'argument', {
          caller: functionName,
          helperBindingId: helperBinding?.id || null
        });
      });
    }

    if (node.type === 'AssignmentExpression') {
      const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
      const storage = resolveStorageObject(node.right, scope, scopeIndex)
        || resolveTrackedStorageParameter(node.right, scope);
      if (storage && node.left?.type !== 'Identifier') {
        addStorageEscape(node.right, 'assignment', {
          base: storage.base,
          area: storage.area,
          storageResolved: !storage.unresolved,
          storageResolution: storage.unresolved || null
        });
      }
      const resolvedHelper = resolveFunctionAlias(node.right, scope, scopeIndex);
      if (resolvedHelper) {
        const helperBinding = resolveFunctionBinding(node.right, scope, scopeIndex);
        addHelperEscape(node.right, resolvedHelper, 'assignment', {
          caller: functionName,
          helperBindingId: helperBinding?.id || null
        });
      }
    }

    if (node.type === 'ReturnStatement' || node.type === 'ExportDefaultDeclaration') {
      const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
      const returned = node.type === 'ExportDefaultDeclaration' ? node.declaration : node.argument;
      const storage = resolveStorageObject(returned, scope, scopeIndex)
        || resolveTrackedStorageParameter(returned, scope);
      if (storage) {
        addStorageEscape(returned, 'return-or-export', {
          base: storage.base,
          area: storage.area,
          storageResolved: !storage.unresolved,
          storageResolution: storage.unresolved || null
        });
      }
      const resolvedHelper = resolveFunctionAlias(returned, scope, scopeIndex);
      if (resolvedHelper) {
        const helperBinding = resolveFunctionBinding(returned, scope, scopeIndex);
        addHelperEscape(returned, resolvedHelper, node.type === 'ReturnStatement' ? 'return' : 'export', {
          caller: functionName,
          helperBindingId: helperBinding?.id || null
        });
      }
    }

    if (node.type === 'ExportSpecifier') {
      const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
      const storage = resolveStorageObject(node.local, scope, scopeIndex)
        || resolveTrackedStorageParameter(node.local, scope);
      if (storage) {
        addStorageEscape(node.local, 'export', {
          base: storage.base,
          area: storage.area,
          storageResolved: !storage.unresolved,
          storageResolution: storage.unresolved || null
        });
      }
      const resolvedHelper = resolveFunctionAlias(node.local, scope, scopeIndex);
      if (resolvedHelper) {
        const helperBinding = resolveFunctionBinding(node.local, scope, scopeIndex);
        addHelperEscape(node.local, resolvedHelper, 'export', {
          caller: functionName,
          helperBindingId: helperBinding?.id || null
        });
      }
    }

    const scope = scopeIndex.scopeByNode.get(node) || scopeIndex.root;
    const trackedStorage = resolveTrackedStorageParameter(node, scope);
    const resolvedStorage = resolveStorageObject(node, scope, scopeIndex) || trackedStorage;
    if (resolvedStorage) {
      const isStorageObjectAlias = !trackedStorage && isSimpleIdentifierAlias(node, parent);
      const isBindingDefinition = parent?.type === 'VariableDeclarator' && parent.id === node;
      const isMemberObject = parent?.type === 'MemberExpression' && parent.object === node;
      const isMemberProperty = parent?.type === 'MemberExpression'
        && parent.property === node
        && !parent.computed;
      const isStorageArgument = parent?.type === 'CallExpression'
        && parent.arguments.includes(node);
      const isSimpleStorageAssignment = parent?.type === 'AssignmentExpression'
        && parent.right === node
        && parent.left?.type === 'Identifier';
      const isTypeofProbe = parent?.type === 'UnaryExpression' && parent.operator === 'typeof';
      const isStoragePresenceProbe = trackedStorage && (
        (parent?.type === 'UnaryExpression' && ['!', 'typeof'].includes(parent.operator))
        || (parent?.type === 'IfStatement' && parent.test === node)
        || (parent?.type === 'ConditionalExpression' && parent.test === node)
        || (parent?.type === 'LogicalExpression' && parent.left === node)
      );
      const isKnownStorageFactory = node.type === 'CallExpression'
        && node.callee?.type === 'Identifier'
        && ['getStorage', 'getSessionStorage'].includes(node.callee.name);
      const isKnownStorageFactoryReturn = (
        parent?.type === 'ReturnStatement'
        || grandparent?.type === 'ReturnStatement'
      ) && ['getStorage', 'getSessionStorage'].includes(functionName);
      const isStorageParameterDeclaration = trackedStorage && storageParameterDeclarationNodes.has(node);
      if (!isStorageParameterDeclaration
          && !isStorageObjectAlias && !isBindingDefinition && !isMemberObject && !isMemberProperty && !isStorageArgument
          && !isSimpleStorageAssignment && !isTypeofProbe && !isKnownStorageFactory
          && !isKnownStorageFactoryReturn && !isStoragePresenceProbe) {
        addStorageEscape(node, 'reference', {
          base: resolvedStorage.base,
          area: resolvedStorage.area,
          storageResolved: !resolvedStorage.unresolved,
          storageResolution: resolvedStorage.unresolved || null
        });
      }
    }

    if (node.type === 'MemberExpression') {
      const storage = resolveStorageObject(node.object, scope, scopeIndex)
        || resolveTrackedStorageParameter(node.object, scope);
      if (storage) {
        const invokedDirectly = (parent?.type === 'CallExpression' && parent.callee === node)
          || (parent?.type === 'ChainExpression'
            && grandparent?.type === 'CallExpression'
            && grandparent.callee === parent);
        const isStorageMethodPart = parent?.type === 'MemberExpression'
          && parent.object === node
          && STORAGE_METHODS.has(propertyName(parent, scope, scopeIndex));
        if (!invokedDirectly && !isStorageMethodPart) {
          addStorageEscape(node, 'member-reference', {
            base: storage.base,
            area: storage.area,
            storageResolved: !storage.unresolved,
            storageResolution: storage.unresolved || null,
            methodExpression: sourceExpression(unit.source, node.property)
          });
        }
      }

      const helperBinding = resolveFunctionBinding(node.object, scope, scopeIndex);
      const helper = helperBinding?.name;
      const isDirectMemberCall = (parent?.type === 'CallExpression' && parent.callee === node)
        || (parent?.type === 'ChainExpression'
          && grandparent?.type === 'CallExpression'
          && grandparent.callee === parent);
      if (helperBinding && !isDirectMemberCall) {
        addHelperEscape(node, helper, 'member-reference', {
          caller: functionName,
          member: propertyName(node, scope, scopeIndex) || '(computed)',
          helperBindingId: helperBinding.id
        });
      }
    }

    const resolvedHelper = node.type === 'Identifier'
      ? resolveFunctionAlias(node, scope, scopeIndex)
      : null;
    const resolvedHelperBinding = node.type === 'Identifier'
      ? resolveFunctionBinding(node, scope, scopeIndex)
      : null;
    if (resolvedHelper) {
      const isDeclaration = isFunctionDeclarationIdentifier(node, parent);
      const isDirectCallee = parent?.type === 'CallExpression' && parent.callee === node;
      const isArgument = parent?.type === 'CallExpression' && parent.arguments.includes(node);
      const isAliasInitializer = isSimpleIdentifierAlias(node, parent)
        && parent.type === 'VariableDeclarator';
      const isAssignmentRhs = parent?.type === 'AssignmentExpression' && parent.right === node;
      const isMemberObject = parent?.type === 'MemberExpression' && parent.object === node;
      const isReturnOrExport = parent?.type === 'ReturnStatement'
        || parent?.type === 'ExportDefaultDeclaration'
        || parent?.type === 'ExportSpecifier';
      if (!isDeclaration && !isDirectCallee && !isArgument && !isAliasInitializer
          && !isAssignmentRhs && !isMemberObject && !isReturnOrExport) {
        addHelperEscape(node, resolvedHelper, 'reference', {
          caller: functionName,
          helperBindingId: resolvedHelperBinding?.id || null
        });
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) value.forEach(child => visit(child, functionName, node, parent));
      else if (isNode(value)) visit(value, functionName, node, parent);
    }
  }

  visit(ast);
  return {
    accesses,
    helperCalls,
    helperEscapes,
    storageEscapes,
    functions: scopeIndex.functions.map(item => ({
      file,
      name: item.name,
      params: item.params,
      bindingId: item.binding?.id || null,
      line: lineNumber(fullSource, unit.offset + item.node.start)
    }))
  };
}

function scanStorageAnalysis(source, file = '', options = {}) {
  const accesses = [];
  const helperCalls = [];
  const helperEscapes = [];
  const storageEscapes = [];
  const functions = [];
  for (const unit of getSourceUnits(source, file)) {
    const analysis = analyzeUnit(unit, source, file, options);
    accesses.push(...analysis.accesses);
    helperCalls.push(...analysis.helperCalls);
    helperEscapes.push(...analysis.helperEscapes);
    storageEscapes.push(...analysis.storageEscapes);
    functions.push(...analysis.functions);
  }
  return { accesses, helperCalls, helperEscapes, storageEscapes, functions };
}

function scanStorageAccesses(source, file = '') {
  return scanStorageAnalysis(source, file).accesses;
}

function discoverProductionSourceFiles(root, options = {}) {
  const extensions = new Set(options.extensions || ['.js', '.html']);
  const excluded = new Set([
    ...DEFAULT_EXCLUDED_DIRECTORIES,
    ...(options.excludeDirectories || [])
  ]);
  const files = [];

  function walk(directory, relativeDirectory = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && excluded.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      const relative = relativeDirectory ? path.join(relativeDirectory, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(absolute, relative);
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(relative.split(path.sep).join('/'));
      }
    }
  }

  walk(root);
  return files.sort();
}

function exceptionMatches(access, exception) {
  return access.file === exception.file
    && access.operation === exception.operation
    && (!exception.helper || access.functionName === exception.helper)
    && (!exception.base || access.base === exception.base)
    && (!exception.area || access.area === exception.area)
    && (!exception.argument || access.argumentExpression === exception.argument)
    && access.storageResolved !== false;
}

function validateStorageAccesses(fileAccesses, {
  registeredSources,
  keys,
  areasByKey = new Map(),
  allowedParameterAccesses = [],
  exceptions = []
}) {
  const errors = [];
  const unresolved = [];
  const usedExceptions = new Set();

  for (const [file, accesses] of fileAccesses) {
    for (const access of accesses) {
      if (!registeredSources.has(file)) {
        errors.push(`${file}:${access.line} is not registered in productionSources`);
      }
      if (access.storageResolved === false) {
        unresolved.push(access);
        errors.push(`${file}:${access.line} has an unresolved storage object: ${access.storageResolution}`);
        continue;
      }
      if (access.operation === 'clear') {
        errors.push(`${file}:${access.line} uses ${access.base}.clear()`);
        continue;
      }
      if (!STORAGE_METHODS.has(access.operation)) {
        unresolved.push(access);
        errors.push(`${file}:${access.line} has an unsupported storage operation: ${access.methodExpression || '(computed)'}`);
        continue;
      }

      const exceptionIndex = exceptions.findIndex(exception => exceptionMatches(access, exception));
      const parameterAllowed = access.helperParameter && allowedParameterAccesses.some(rule => (
        rule.file === file
        && (!rule.function || rule.function === access.functionName)
        && (!rule.parameter || rule.parameter === access.base)
        && (!rule.operation || rule.operation === access.operation)
        && (!rule.key || rule.key === access.resolvedKey)
      ));
      if (access.helperParameter && exceptionIndex < 0 && !parameterAllowed) {
        unresolved.push(access);
        errors.push(`${file}:${access.line} uses a storage parameter outside a declared helper contract: ${access.base}`);
      }
      if (access.resolvedKey != null) {
        if (!keys.has(access.resolvedKey)) {
          errors.push(`${file}:${access.line} uses an unregistered storage key: ${access.resolvedKey}`);
        }
        const expectedAreas = areasByKey instanceof Map
          ? areasByKey.get(access.resolvedKey)
          : areasByKey[access.resolvedKey];
        const allowedAreas = expectedAreas instanceof Set
          ? expectedAreas
          : new Set(Array.isArray(expectedAreas) ? expectedAreas : [expectedAreas].filter(Boolean));
        if (allowedAreas.size && !allowedAreas.has(access.area) && !parameterAllowed) {
          errors.push(`${file}:${access.line} uses ${access.area || '(unknown)'} for ${access.resolvedKey}; ledger requires ${Array.from(allowedAreas).join('/')}`);
        }
        continue;
      }
      if (exceptionIndex >= 0) {
        usedExceptions.add(exceptionIndex);
        continue;
      }
      unresolved.push(access);
      errors.push(`${file}:${access.line} has an unresolved storage key: ${access.argumentExpression || '(empty)'}`);
    }
  }

  exceptions.forEach((exception, index) => {
    if (!usedExceptions.has(index)) {
      errors.push(`dynamic access exception is unused: ${exception.file}:${exception.helper || '*'}:${exception.operation}:${exception.argument || '*'}`);
    }
  });

  return { errors, unresolved };
}

function storageArgumentContractMatches(escape, contract) {
  if (!contract.storageParameter || escape.kind !== 'argument' || escape.storageResolved === false) return false;
  const storageArgumentIndex = Number.isInteger(contract.storageArgumentIndex)
    ? contract.storageArgumentIndex
    : 0;
  if (escape.argumentIndex !== storageArgumentIndex) return false;
  const expectedCallee = contract.helper || contract.function;
  return contract.file === escape.file
    && expectedCallee === escape.resolvedCallee
    && !!escape.resolvedCalleeBindingId;
}

function validateStorageReferenceEscapes(analyses, contracts = []) {
  const errors = [];
  const allAnalyses = Array.isArray(analyses) ? analyses : [];
  const storageContracts = contracts.filter(contract => contract.storageParameter);

  for (const analysis of allAnalyses) {
    for (const escape of analysis.storageEscapes || []) {
      const contract = storageContracts.find(item => {
        if (!storageArgumentContractMatches(escape, item)) return false;
        const expectedCallee = item.helper || item.function;
        const candidates = (analysis.functions || []).filter(fn => fn.name === expectedCallee);
        return candidates.length === 1 && candidates[0].bindingId === escape.resolvedCalleeBindingId;
      });
      if (contract) continue;
      errors.push(
        `${analysis.file}:${escape.line} storage reference is outside a declared contract (${escape.kind}): ${escape.expression || '(empty)'}`
      );
    }
  }

  return errors;
}

function validateStorageParameterBindings(analyses, contracts = []) {
  const errors = [];
  for (const contract of contracts) {
    const analysis = analyses.find(item => item.file === contract.file);
    if (!analysis) {
      errors.push(`storage parameter contract source is not analyzed: ${contract.file}`);
      continue;
    }
    const candidates = (analysis.functions || []).filter(item => item.name === contract.function);
    if (candidates.length !== 1) {
      errors.push(
        `storage parameter binding is ${candidates.length === 0 ? 'not found' : 'ambiguous'}: ${contract.file}:${contract.function}`
      );
      continue;
    }
    if (!(candidates[0].params || []).includes(contract.parameter)) {
      errors.push(`storage parameter is not found: ${contract.file}:${contract.function}:${contract.parameter}`);
    }
  }
  return errors;
}

function validateStorageAnalyses(analyses, options = {}) {
  const allAnalyses = Array.isArray(analyses) ? analyses : [];
  const fileAccesses = new Map(allAnalyses.map(analysis => [analysis.file, analysis.accesses || []]));
  const accessValidation = validateStorageAccesses(fileAccesses, options);
  const storageReferenceErrors = validateStorageReferenceEscapes(
    allAnalyses,
    [
      ...(options.helperContracts || []),
      ...(options.allowedParameterAccesses || [])
    ]
  );
  const helperErrors = validateHelperContracts(allAnalyses, options.helperContracts || []);
  const storageParameterErrors = validateStorageParameterBindings(
    allAnalyses,
    options.allowedParameterAccesses || []
  );
  return {
    errors: [
      ...accessValidation.errors,
      ...storageReferenceErrors,
      ...helperErrors,
      ...storageParameterErrors
    ],
    unresolved: [
      ...accessValidation.unresolved,
      ...allAnalyses.flatMap(analysis => analysis.storageEscapes || [])
    ],
    accessValidation,
    storageReferenceErrors,
    helperErrors,
    storageParameterErrors
  };
}

function validateHelperContracts(analyses, contracts = []) {
  const errors = [];
  const allAnalyses = Array.isArray(analyses) ? analyses : [];

  for (const contract of contracts) {
    const analysis = allAnalyses.find(item => item.file === contract.file);
    if (!analysis) {
      errors.push(`helper contract source is not analyzed: ${contract.file}`);
      continue;
    }
    const helperCandidates = analysis.functions.filter(item => item.name === contract.helper);
    if (helperCandidates.length !== 1) {
      if (helperCandidates.length === 0) {
      errors.push(`helper function is not found: ${contract.file}:${contract.helper}`);
      } else {
        errors.push(`helper function binding is ambiguous: ${contract.file}:${contract.helper}`);
      }
      continue;
    }
    const helperFunction = helperCandidates[0];
    if (contract.keyParameter && !helperFunction.params.includes(contract.keyParameter)) {
      errors.push(`helper key parameter is missing: ${contract.file}:${contract.helper}:${contract.keyParameter}`);
    }
    if (contract.storageParameter && !helperFunction.params.includes(contract.storageParameter)) {
      errors.push(`helper storage parameter is missing: ${contract.file}:${contract.helper}:${contract.storageParameter}`);
    }

    const calls = analysis.helperCalls.filter(call => (
      call.resolvedHelperBindingId === helperFunction.bindingId
    ));
    const usedCalls = new Set();
    calls.forEach(call => {
      const keyIndex = Number.isInteger(contract.keyArgumentIndex) ? contract.keyArgumentIndex : 0;
      const resolvedKey = call.resolvedArguments[keyIndex] ?? null;
      const area = contract.storageParameter ? call.storageArea : contract.implicitStorageArea;
      if (resolvedKey == null) {
        errors.push(`${contract.file}:${call.line} ${contract.helper}のキー引数を静的に解決できません: ${call.argumentExpressions[keyIndex] || '(empty)'}`);
        return;
      }
      const allowedIndex = (contract.allowedCalls || []).findIndex((allowed, index) => {
        return !usedCalls.has(index)
          && allowed.caller === call.caller
          && allowed.area === area
          && allowed.key === resolvedKey;
      });
      if (allowedIndex < 0) {
        errors.push(`${contract.file}:${call.line} ${contract.helper}の許可されていない呼出元・領域・キーです: ${call.caller}/${area}/${resolvedKey}`);
        return;
      }
      usedCalls.add(allowedIndex);
    });

    (contract.allowedCalls || []).forEach((allowed, index) => {
      if (!usedCalls.has(index)) {
        errors.push(`helper contract call is unused: ${contract.file}:${contract.helper}:${allowed.caller}/${allowed.area}/${allowed.key}`);
      }
    });

    for (const escape of analysis.helperEscapes || []) {
      if (escape.helperBindingId !== helperFunction.bindingId) continue;
      errors.push(
        `${contract.file}:${escape.line} ${contract.helper}が契約範囲外へ流出しています (${escape.kind}): ${escape.expression || '(empty)'}`
      );
    }
  }

  return errors;
}

module.exports = {
  discoverProductionSourceFiles,
  scanStorageAccesses,
  scanStorageAnalysis,
  validateStorageAccesses,
  validateStorageReferenceEscapes,
  validateStorageAnalyses,
  validateHelperContracts
};
