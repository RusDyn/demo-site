import noTransitiveReexports from './rules/no-transitive-reexports.js';
import noTrivialWrappers from './rules/no-trivial-wrappers.js';

export default {
  rules: {
    'no-transitive-reexports': noTransitiveReexports,
    'no-trivial-wrappers': noTrivialWrappers,
  },
};