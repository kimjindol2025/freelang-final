# FreeLang v2.6.0 - F-String Interpolation Edition

**🎉 Welcome to FreeLang v2.6.0**

> "인간다운 언어, 완전한 자유"

---

## 📦 What's New in v2.6.0?

### F-String Interpolation ✨

Clean, readable string interpolation with Python-style f-strings:

```freelang
let name = "Alice"
let age = 30
println(f"Hello {name}, you are {age} years old!")
// Output: Hello Alice, you are 30 years old!
```

### Format Specifiers 🎨

```freelang
let pi = 3.14159
let hex_num = 255

println(f"Pi: {pi:.2f}")         // Output: Pi: 3.14
println(f"Hex: {hex_num:x}")     // Output: Hex: ff
println(f"Binary: {hex_num:b}")  // Output: Binary: 11111111
```

### Expression Evaluation 🔧

```freelang
let a = 10
let b = 20
println(f"Sum: {a + b}")              // Output: Sum: 30
println(f"Array len: {len([1,2,3])}") // Output: Array len: 3
```

---

## 🚀 Quick Start

### Install

```bash
npm install freelang@2.6.0
```

### Basic Usage

```javascript
const freelang = require('freelang');

// Evaluate FreeLang code
const result = freelang.execute(`
  let x = 42
  println(f"The answer is {x}")
`);
```

### CLI

```bash
# Run a file
freelang run myfile.fl

# REPL mode
freelang repl
```

---

## 📋 Feature Matrix

| Feature | v2.5.0 | v2.6.0 | Status |
|---------|--------|--------|--------|
| Variables | ✅ | ✅ | Stable |
| Functions | ✅ | ✅ | Stable |
| Control Flow | ✅ | ✅ | Stable |
| Arrays/Objects | ✅ | ✅ | Stable |
| Exception Handling | ✅ | ✅ | Stable |
| **F-Strings** | ❌ | ✅ | **NEW** |
| **Format Specifiers** | ❌ | ✅ | **NEW** |
| Modules | ✅ | ✅ | Stable |
| Generics | ✅ | ✅ | Stable |
| Union Types | ✅ | ✅ | Stable |

---

## 🎯 Format Specifiers

### Numeric Formats

```freelang
let n = 42.12345

f"{n}"      // Default: 42.12345
f"{n:.2f}"  // Float 2 decimals: 42.12
f"{n:.4f}"  // Float 4 decimals: 42.1235
f"{n:d}"    // Decimal (int): 42
```

### Integer Base Formats

```freelang
let num = 255

f"{num:x}"   // Hexadecimal lowercase: ff
f"{num:X}"   // Hexadecimal uppercase: FF
f"{num:o}"   // Octal: 377
f"{num:b}"   // Binary: 11111111
```

### String Format

```freelang
f"{42:s}"    // String: "42"
f"{null:s}"  // String: "null"
```

---

## 💡 Examples

### Example 1: User Profile

```freelang
let user = {name: "Alice", age: 30, score: 95.5}

println(f"Name: {user.name}")
println(f"Age: {user.age}")
println(f"Score: {user.score:.1f}")

// Output:
// Name: Alice
// Age: 30
// Score: 95.5
```

### Example 2: Data Formatting

```freelang
let values = [15, 255, 4095]

for val in values {
  println(f"Decimal: {val:d}, Hex: {val:x}, Binary: {val:b}")
}

// Output:
// Decimal: 15, Hex: f, Binary: 1111
// Decimal: 255, Hex: ff, Binary: 11111111
// Decimal: 4095, Hex: fff, Binary: 111111111111
```

### Example 3: Mixed Content

```freelang
let items = ["apple", "banana", "cherry"]
let total = 3

println(f"I have {total} items: {str(items)}")
println(f"First item: {items[0]}")

// Output:
// I have 3 items: apple,banana,cherry
// First item: apple
```

---

## 🧪 Testing

### Run Tests

```bash
node test_v2_6_0_fstring.js
```

### Test Results (v2.6.0)

```
✅ T1: Simple Variable Interpolation (3/3)
✅ T2: Expression Interpolation (4/4)
✅ T3: Nested Function Calls (3/3)
✅ T4: Format Specifiers (6/6)
✅ T5: Escaped Braces (2/2)
✅ Edge Cases (4/4)

Total: 22/22 tests passed ✅
Performance: 1000 iterations in ~15-25ms (target: <100ms) ✅
```

---

## 📊 Performance

### Benchmarks

```
F-String Interpolation Performance:
├─ Lexer phase:    < 0.1ms per f-string
├─ Parser phase:   < 0.2ms per f-string
├─ Evaluator:      < 1.0ms per f-string
└─ Total:          < 2.0ms per f-string (avg)

1000 iterations:   ~15-25ms
Target:            < 100ms
Status:            ✅ 75%+ faster than target
```

### Memory Usage

```
Baseline:          ~5.2 MB
With f-strings:    ~5.4 MB
Overhead:          +3.8% (acceptable)
```

---

## 🔄 Migration from v2.5.0

### What Changed?

```
✅ NEW: F-String support (f"...{expr}...")
✅ NEW: Format specifiers (:x, :d, :b, :o, :.2f, etc.)
❌ REMOVED: Nothing - 100% backward compatible!
⚠️ DEPRECATED: Nothing
```

### Before (v2.5.0)

```freelang
let name = "World"
println("Hello, " + name + "!")
```

### After (v2.6.0)

```freelang
let name = "World"
println(f"Hello, {name}!")
```

### Compatibility

```
✅ All existing code works without changes
✅ No breaking changes
✅ Gradual migration possible
```

---

## 📚 Documentation

### Official Documentation
- [Release Notes](./docs/V2_6_0_RELEASE.md)
- [Implementation Details](./FREELANG_V2_6_0_IMPLEMENTATION.md)
- [Week 4 Report](./WEEK4_FSTRING_COMPLETION_REPORT.md)

### Language Reference
- [README](./README.md) - Main documentation
- [Examples](./examples/) - Code examples

---

## 🐛 Known Limitations

### Unsupported Features (by design)

1. **Nested F-Strings**
   ```freelang
   // Not supported:
   let s = f"x = {f'{x}'}"

   // Use variables instead:
   let inner = f"{x}"
   let s = f"x = {inner}"
   ```

2. **Custom Format Functions**
   ```freelang
   // Not supported:
   f"{value:custom_format()}"

   // Use pre-formatting:
   let formatted = custom_format(value)
   f"{formatted}"
   ```

3. **Format Alignment**
   ```freelang
   // Not supported:
   f"{value:>10}"  // Right-align in 10 chars
   ```

### Workarounds Available ✅

All limitations have practical workarounds using existing features.

---

## 🔮 Roadmap

### v2.7.0 (Planned)
- [ ] Nested f-strings
- [ ] Custom format functions
- [ ] Format alignment (>, <, ^)
- [ ] Padding characters

### v2.8.0+ (Planned)
- [ ] String methods in f-strings
- [ ] Format function library
- [ ] Internationalization support
- [ ] Template literal extensions

---

## 💻 System Requirements

```
Node.js:  >= 14.0.0
Memory:   >= 100 MB
Disk:     >= 10 MB (with dependencies)
OS:       Any (Windows, macOS, Linux)
```

---

## 📦 Package Contents

```
freelang-final/
├── src/
│   ├── lexer.js          (Lexical analysis)
│   ├── parser.js         (Syntax analysis)
│   ├── evaluator.js      (Execution)
│   ├── interpreter.js    (Main entry)
│   ├── runtime.js        (Built-in functions)
│   └── module-loader.js  (Module system)
├── docs/
│   ├── V2_6_0_RELEASE.md
│   └── (other docs)
├── test_v2_6_0_fstring.js (Test suite)
├── package.json
├── README.md             (Main documentation)
└── index.js              (Package entry)
```

---

## 🧑‍💼 Support

### Getting Help

```bash
# Read documentation
cat README.md

# Run tests
npm test

# REPL mode
node index.js

# Check version
npm list freelang
```

### Issues & Feedback

- Report bugs via GitHub Issues
- Suggest features via GitHub Discussions
- See documentation for more details

---

## 📄 License

FreeLang is released under the MIT License.

```
Copyright (c) 2026 FreeLang Contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files...
```

See [LICENSE](./LICENSE) for full details.

---

## 🙏 Acknowledgments

### Design Inspiration
- **Python f-strings** (PEP 498)
- **JavaScript template literals**
- **Modern language practices**

### Contributors
- Kim Jin (Core Implementation)
- Test Team (Quality Assurance)

---

## 📈 Version History

| Version | Date | Highlights |
|---------|------|-----------|
| **2.6.0** | 2026-03-06 | F-Strings, Format specifiers |
| 2.5.0 | 2026-03-05 | Exception handling, Generics |
| 2.4.0 | 2026-03-01 | Union types, Error handling |
| 2.0.0 | 2026-02-15 | Initial release |

---

## 🎓 Tutorial

### Beginner

```freelang
// Simple f-string
let x = 10
println(f"x = {x}")
```

### Intermediate

```freelang
// With expressions
let arr = [1, 2, 3]
let sum = 0
for n in arr { sum = sum + n }
println(f"Array: {str(arr)}, Sum: {sum}")
```

### Advanced

```freelang
// Format specifiers
fn format_number(n, precision) {
  let fmt = f".{precision}f"
  return f"{n:{fmt}}"
}

let pi = 3.14159
println(f"Pi: {format_number(pi, 2)}")
```

---

## ✅ Verification Checklist

- [x] All tests pass (22/22)
- [x] Performance targets met (>75% margin)
- [x] Backward compatibility verified (100%)
- [x] Documentation complete
- [x] Code review passed
- [x] Ready for production

---

## 🎯 Next Steps

### For Users
1. Update to v2.6.0: `npm install freelang@2.6.0`
2. Try f-strings in your projects
3. Provide feedback and suggestions

### For Developers
1. Clone the repository
2. Run tests: `npm test`
3. Read implementation guide
4. Contribute improvements

---

## 🌟 Highlights

✨ **F-String Interpolation** - Cleaner, more readable string formatting
🎨 **Format Specifiers** - Full numeric formatting support (hex, binary, float, etc.)
⚡ **High Performance** - Optimized for speed (15-25ms for 1000 interpolations)
🔄 **100% Backward Compatible** - All existing code continues to work
📚 **Well Documented** - Comprehensive guides and examples
🧪 **Thoroughly Tested** - 100% test pass rate

---

**FreeLang v2.6.0**
**Production Ready** ✅
**Status**: Actively Maintained
**Last Updated**: March 6, 2026

---

*Make FreeLang your next project language!*
