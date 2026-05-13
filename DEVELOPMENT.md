# Development Guidelines

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/Daniboss-1/cad.git
cd cad

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

---

## Git Workflow

### Branch Naming Convention

```
feature/description          # New features
bugfix/description          # Bug fixes
refactor/description        # Refactoring
docs/description            # Documentation
test/description            # Test additions
chore/description           # Maintenance tasks
```

### Commit Message Format

```
[TYPE] Brief description (50 chars max)

Detailed explanation if needed (wrap at 72 chars).

Fixes #123 (if applicable)
Related to #456 (if applicable)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance
- `perf:` Performance improvement

### Example

```
feat: Add CSG union operation to kernel

- Implement union operation for two manifolds
- Add unit tests for edge cases
- Update documentation

Fixes #42
```

---

## Code Style

### TypeScript Guidelines

1. **Use strict mode** in `tsconfig.json`
2. **Type everything** - no `any` unless absolutely necessary
3. **Use interfaces** for object shapes
4. **Use enums** for fixed value sets

```typescript
// ✅ Good
interface Model {
  id: string
  name: string
  vertices: Vector3[]
}

enum OperationType {
  Union = 'union',
  Subtract = 'subtract',
  Intersect = 'intersect',
}

// ❌ Avoid
const addModel = (model: any) => {
  return model
}
```

### React Best Practices

1. **Functional components** only - no class components
2. **Custom hooks** for reusable logic
3. **Prop drilling minimization** - use Zustand store
4. **Memoization** for expensive computations

```typescript
// ✅ Good
interface CanvasProps {
  modelId: string
}

const Canvas: React.FC<CanvasProps> = ({ modelId }) => {
  const model = useModelStore((state) => state.getModel(modelId))
  
  return <canvas ref={canvasRef} />
}

export default memo(Canvas)

// ❌ Avoid
const Canvas = (props) => {
  return <canvas {...props} />
}
```

### Component Organization

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react'
import { useStore } from '@/store'

// 2. Types
interface ComponentProps {
  id: string
}

// 3. Component
const MyComponent: React.FC<ComponentProps> = ({ id }) => {
  // Logic here
  return <div>Component</div>
}

// 4. Exports
export default memo(MyComponent)
```

---

## Testing Requirements

### Unit Test Template

```typescript
// src/lib/__tests__/csg.test.ts
import { createUnion, createSubtract } from '@/lib/csg'
import { Manifold } from 'manifold-3d'

describe('CSG Operations', () => {
  test('should create union of two manifolds', () => {
    const m1 = new Manifold()
    const m2 = new Manifold()
    
    const result = createUnion(m1, m2)
    
    expect(result).toBeDefined()
    expect(result.properties()).toBeDefined()
  })

  test('should handle edge cases', () => {
    const m1 = new Manifold()
    
    expect(() => createUnion(m1, null)).toThrow()
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- csg.test.ts

# Generate coverage report
npm test -- --coverage
```

### Coverage Targets

- **Lines**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Statements**: 80%+

---

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests added and all pass
- [ ] No console.log or debug code
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts
- [ ] Performance impact assessed
- [ ] Accessibility considered

---

## Performance Tips

1. **Lazy load components**
   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'), {
     loading: () => <LoadingSpinner />
   })
   ```

2. **Memoize expensive calculations**
   ```typescript
   const memoizedValue = useMemo(() => expensiveOperation(), [dep])
   ```

3. **Use React.memo for props**
   ```typescript
   export default memo(MyComponent)
   ```

4. **Avoid inline functions in render**
   ```typescript
   // ❌ Avoid
   <button onClick={() => handleClick()} />
   
   // ✅ Good
   <button onClick={handleClick} />
   ```

---

## Debugging

### Development Mode
```bash
npm run dev
```

### Browser DevTools
- React DevTools extension for component inspection
- Redux/Zustand DevTools for state debugging
- Network tab for API calls
- Console for errors

### Logging
```typescript
// Use conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

---

## Building for Production

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start
```

---

## Common Issues & Solutions

### Issue: Three.js context error
**Solution**: Ensure Three.js canvas component is wrapped with Suspense

### Issue: Manifold-3D WASM not loading
**Solution**: Check `next.config.mjs` webpack configuration

### Issue: State not updating in component
**Solution**: Ensure Zustand hook selector is correctly implemented

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Three.js Docs](https://threejs.org/docs)
- [Manifold-3D Docs](https://manifold3d.org)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## Questions?

Open an issue or start a discussion in the repository.
