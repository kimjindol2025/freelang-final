// FreeLang v2 - Intent Pattern Database
// Machine-readable patterns for header generation
// (No human-facing keywords - just operation definitions)

export interface OpPattern {
  op: string;           // operation name: "sum", "avg", "max", etc
  input: string;        // "array<number>"
  output: string;       // "number" or "array<number>"
  reason: string;       // business rationale (machine readable)
  directive: string;    // optimization hint
  complexity: string;   // O(n), O(n^2), etc
}

export const patterns: Record<string, OpPattern> = {
  sum: {
    op: 'sum',
    input: 'array<number>',
    output: 'number',
    reason: 'statistical_operation',
    directive: 'memory_efficient',
    complexity: 'O(n)',
  },
  average: {
    op: 'average',
    input: 'array<number>',
    output: 'number',
    reason: 'data_analysis',
    directive: 'accuracy_first',
    complexity: 'O(n)',
  },
  max: {
    op: 'max',
    input: 'array<number>',
    output: 'number',
    reason: 'optimization_problem',
    directive: 'single_pass',
    complexity: 'O(n)',
  },
  min: {
    op: 'min',
    input: 'array<number>',
    output: 'number',
    reason: 'search_algorithm',
    directive: 'single_pass',
    complexity: 'O(n)',
  },
  filter: {
    op: 'filter',
    input: 'array<number>',
    output: 'array<number>',
    reason: 'data_preprocessing',
    directive: 'predicate_based',
    complexity: 'O(n)',
  },
  sort: {
    op: 'sort',
    input: 'array<number>',
    output: 'array<number>',
    reason: 'sorting_algorithm',
    directive: 'in_place',
    complexity: 'O(n*log(n))',
  },
  reverse: {
    op: 'reverse',
    input: 'array<number>',
    output: 'array<number>',
    reason: 'array_manipulation',
    directive: 'in_place',
    complexity: 'O(n)',
  },
  count: {
    op: 'count',
    input: 'array<number>',
    output: 'number',
    reason: 'cardinality_measure',
    directive: 'fast_lookup',
    complexity: 'O(1)',
  },
  length: {
    op: 'length',
    input: 'array<number>',
    output: 'number',
    reason: 'size_measurement',
    directive: 'fast_lookup',
    complexity: 'O(1)',
  },
  find: {
    op: 'find',
    input: 'array<number>',
    output: 'number',
    reason: 'search_operation',
    directive: 'early_exit',
    complexity: 'O(n)',
  },
  contains: {
    op: 'contains',
    input: 'array<number>',
    output: 'boolean',
    reason: 'membership_test',
    directive: 'early_exit',
    complexity: 'O(n)',
  },
  map: {
    op: 'map',
    input: 'array<number>',
    output: 'array<number>',
    reason: 'element_transformation',
    directive: 'functional',
    complexity: 'O(n)',
  },
  unique: {
    op: 'unique',
    input: 'array<number>',
    output: 'array<number>',
    reason: 'deduplication',
    directive: 'hash_based',
    complexity: 'O(n)',
  },
  flatten: {
    op: 'flatten',
    input: 'array<array<number>>',
    output: 'array<number>',
    reason: 'dimension_reduction',
    directive: 'recursive',
    complexity: 'O(n)',
  },
};

// Keyword matching (normalized, no human language)
export const keywordToOp: Record<string, string> = {
  // sum variants
  'sum': 'sum',
  'add': 'sum',
  'total': 'sum',
  '+': 'sum',

  // average
  'avg': 'average',
  'average': 'average',
  'mean': 'average',
  '~': 'average',

  // max
  'max': 'max',
  'maximum': 'max',
  'highest': 'max',

  // min
  'min': 'min',
  'minimum': 'min',
  'lowest': 'min',

  // filter
  'filter': 'filter',
  'where': 'filter',
  'select': 'filter',

  // sort
  'sort': 'sort',
  'sorted': 'sort',
  'order': 'sort',

  // reverse
  'reverse': 'reverse',
  'reversed': 'reverse',

  // count
  'count': 'count',
  'size': 'count',
  'len': 'length',
  'length': 'length',

  // find
  'find': 'find',
  'search': 'find',
  'locate': 'find',

  // contains
  'contains': 'contains',
  'has': 'contains',
  'include': 'contains',

  // map
  'map': 'map',
  'transform': 'map',
  'convert': 'map',

  // unique
  'unique': 'unique',
  'distinct': 'unique',
  'dedupe': 'unique',

  // flatten
  'flatten': 'flatten',
  'flat': 'flatten',
  'merge': 'flatten',
};
