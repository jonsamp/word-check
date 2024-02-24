# this-file

If you are an author of open source repository, you may want to support both CJS and ESM for users since it's a confused period. It's hard to use `__dirname` and `import.meta.url` in one file specially for typescript project.

# Installation

```bash
yarn add this-file
```

# Usage

```typescript
// In per file
import { createContext } from 'this-file';

const context = createContext();

// CJS
context.filename IS __filename
context.dirname IS __dirname
context.require IS require

// ESM
context.filename IS url.fileURLToPath(import.meta.url)
context.dirname IS path.dirname(context.filename)
context.require IS module.createContext(import.meta.url)
```
