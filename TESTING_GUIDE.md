# Testing Guide for Arogya-Swarm

## Overview
This document provides comprehensive instructions for testing the Arogya-Swarm application.

## Backend Testing (Python/FastAPI)

### Setup
```bash
cd backend
pip install pytest pytest-asyncio pytest-cov httpx
```

### Running Tests
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run tests with coverage
pytest --cov=. --cov-report=html

# Run only agent tests
pytest tests/test_agents.py -v
```

### Test Structure
- `tests/conftest.py` - Test configuration and fixtures
- `tests/test_api.py` - API endpoint tests
- `tests/test_agents.py` - AI agent tests

### Writing New Tests

#### API Tests
```python
@pytest.mark.asyncio
async def test_my_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/my-endpoint")
        assert response.status_code == 200
        data = response.json()
        assert "expected_field" in data
```

#### Agent Tests
```python
@pytest.mark.asyncio
async def test_my_agent():
    result = await my_agent.process(input_data)
    assert result is not None
    assert hasattr(result, 'expected_attribute')
```

### Test Coverage Goals
- **Target**: 80% overall coverage
- **Critical paths**: 95%+ coverage
- **AI agents**: 75%+ coverage
- **API endpoints**: 90%+ coverage

## Frontend Testing (React/TypeScript)

### Setup
```bash
cd frontend
npm install
# Testing dependencies are in package.json
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `src/tests/setup.ts` - Test configuration
- `src/tests/hooks.test.ts` - Custom hooks tests
- `src/tests/database.test.ts` - IndexedDB tests
- `src/tests/components/` - Component tests (to be added)

### Writing Component Tests

#### Example: Testing a Component
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const { user } = render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

#### Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../hooks/useMyHook';

it('should update state correctly', () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.updateValue('new value');
  });
  
  expect(result.current.value).toBe('new value');
});
```

### Test Coverage Goals
- **Target**: 80% overall coverage
- **Custom hooks**: 90%+ coverage
- **Critical components**: 85%+ coverage
- **Utility functions**: 95%+ coverage

## Integration Testing

### API Integration Tests
Test the full flow from API request to response:

```python
@pytest.mark.asyncio
async def test_patient_workflow():
    # Create patient
    patient_response = await client.post("/api/v1/patients/", json=patient_data)
    patient_id = patient_response.json()["id"]
    
    # Create diagnosis
    diagnosis_response = await client.post(
        "/api/v1/diagnosis/analyze",
        json={"patient_id": patient_id, "symptoms": ["fever"]}
    )
    
    assert diagnosis_response.status_code == 200
```

### End-to-End Testing
For E2E tests, consider using Playwright or Cypress:

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest --cov

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

## Testing Best Practices

### General Principles
1. **Write tests first** (TDD when possible)
2. **Keep tests simple** and focused
3. **Test behavior, not implementation**
4. **Use meaningful test names**
5. **Mock external dependencies**

### Naming Conventions
- Test files: `test_*.py` (backend), `*.test.ts` (frontend)
- Test functions: `test_<what_it_tests>`
- Test classes: `Test<ComponentName>`

### Fixtures and Mocks
- Use fixtures for reusable test data
- Mock external API calls
- Mock file system operations
- Mock database connections in unit tests

### Test Organization
```
tests/
├── unit/           # Fast, isolated tests
├── integration/    # Tests with dependencies
└── e2e/           # Full workflow tests
```

## Performance Testing

### Backend Performance
```bash
# Use locust for load testing
pip install locust
locust -f tests/locustfile.py
```

### Frontend Performance
Use Lighthouse or WebPageTest for performance audits:
```bash
# Lighthouse
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

## Manual Testing Checklist

### ASHA Interface
- [ ] Voice patient registration works
- [ ] Symptom checker provides accurate results
- [ ] Offline mode saves data locally
- [ ] Data syncs when online
- [ ] Voice instructions work in Hindi

### Doctor Dashboard
- [ ] Patient queue displays correctly
- [ ] Patients sorted by severity
- [ ] AI summaries are visible
- [ ] Prescription creation works
- [ ] Video call integration functional

### Admin Dashboard
- [ ] Surge predictions display
- [ ] Inventory alerts show
- [ ] Analytics charts render
- [ ] Staff allocation works
- [ ] System health accurate

### PWA Features
- [ ] App installs on mobile
- [ ] Works offline
- [ ] Push notifications work
- [ ] Background sync operates
- [ ] Service worker updates

## Debugging Tests

### Backend
```bash
# Run with debugging
pytest -s  # Show print statements
pytest --pdb  # Drop into debugger on failure
```

### Frontend
```bash
# Run specific test file
npm test -- hooks.test.ts

# Debug mode
npm test -- --inspect-brk
```

## Resources

### Documentation
- [pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

### Tools
- **pytest** - Python testing framework
- **vitest** - Vite-native test framework
- **Testing Library** - React testing utilities
- **httpx** - Async HTTP client for testing
- **coverage.py** - Python code coverage
- **c8/v8** - JavaScript code coverage

## Troubleshooting

### Common Issues

#### Backend Tests Fail
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### Frontend Tests Fail
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

#### Database Tests Fail
```bash
# Clear test database
rm -rf test.db
```

## Contributing Tests

When contributing, please:
1. Write tests for new features
2. Update existing tests when modifying features
3. Ensure all tests pass before submitting PR
4. Maintain or improve coverage percentage
5. Document complex test scenarios

## Contact

For testing questions or issues:
- GitHub Issues: https://github.com/Anuj-ml/Arogya-Swarm/issues
- Email: contact@arogya-swarm.in
