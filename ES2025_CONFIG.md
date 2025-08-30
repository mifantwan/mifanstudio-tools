# ECMAScript 2025 Configuration

This project has been updated to support ECMAScript 2025 (ES2025) features and modern JavaScript standards.

## Key Changes

### 1. Babel Configuration
- Updated `@babel/preset-env` to target modern browsers that support ES2025 features
- Added modern browser targets (Chrome 120+, Firefox 121+, Safari 17+, Edge 120+)
- Added support for modern JavaScript features:
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - Logical assignment operators (`&&=`, `||=`, `??=`)
  - Class properties and private fields
  - Top-level await

### 2. Browser Support
- Modern browsers only (last 2 versions)
- Minimum browser versions that support ES2025 features
- Mobile browsers: iOS 17+, Android 14+

### 3. Webpack Configuration
- Enabled `topLevelAwait` for ES2025 support
- Configured output environment for modern JavaScript features
- ES modules output with full ES2025 compatibility

### 4. PostCSS Configuration
- Updated Autoprefixer to target modern browsers
- Uses `.browserslistrc` for consistent browser targeting

## Features Supported

### ES2025 Features
- **Top-level await**: Use `await` at the module level
- **Optional chaining**: `obj?.prop?.method()`
- **Nullish coalescing**: `value ?? defaultValue`
- **Logical assignment**: `x &&= y`, `x ||= y`, `x ??= y`
- **Class fields**: Public and private class fields
- **Static class blocks**: `static { ... }`
- **Array grouping**: `Object.groupBy()`, `Map.groupBy()`
- **Promise.withResolvers()**: Create promises with external resolvers

### Modern JavaScript Features
- **Arrow functions**: `() => {}`
- **Destructuring**: `const { a, b } = obj`
- **Template literals**: `` `Hello ${name}` ``
- **Dynamic imports**: `import()`
- **ES modules**: `import`/`export`

## Browser Compatibility

The build targets browsers that support ES2025 features:

- **Desktop**: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- **Mobile**: iOS 17+, Android 14+, Chrome Android 120+, Firefox Android 121+
- **Samsung**: Samsung Internet 23+

## Usage

### Development
```bash
yarn dev
```

### Production Build
```bash
yarn build
```

### Install Dependencies
```bash
yarn install-deps
```

## Node.js Requirements

- **Minimum**: Node.js 18.0.0+
- **Recommended**: Node.js 20.0.0+

## Migration Notes

If you're migrating from an older configuration:

1. Update your Node.js version to 18.0.0+
2. Run `yarn install-deps` to install new dependencies
3. Update your code to use modern ES2025 features
4. Test in modern browsers only

## Example ES2025 Code

```javascript
// Top-level await
const data = await fetch('/api/data').then(r => r.json());

// Optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Anonymous';

// Logical assignment
let config = {};
config.apiUrl ??= 'https://api.example.com';

// Class fields
class User {
  #privateField = 'private';
  static #privateStaticField = 'private static';
  
  constructor(name) {
    this.name = name;
  }
  
  static {
    // Static initialization block
    console.log('Class initialized');
  }
}

// Array grouping (ES2025)
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 }
];

const groupedByAge = Object.groupBy(users, user => user.age);
// Result: { 25: [...], 30: [...] }
```
