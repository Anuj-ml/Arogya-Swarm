# Contributing to Arogya-Swarm

First off, thank you for considering contributing to Arogya-Swarm! It's people like you that make this project a great tool for rural healthcare.

## 🎯 Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Python/Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List alternatives** you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request**

## 💻 Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Arogya-Swarm.git
cd Arogya-Swarm

# Set up backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Set up frontend
cd ../frontend
npm install
cp .env.example .env
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow the coding style
   - Write clear commit messages
   - Add tests if applicable

3. **Test your changes**
   ```bash
   # Backend
   cd backend
   pytest
   
   # Frontend
   cd frontend
   npm test
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

## 📝 Coding Standards

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions focused and small
- Use meaningful variable names

Example:
```python
async def analyze_symptoms(
    symptoms: List[str],
    patient_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze patient symptoms.
    
    Args:
        symptoms: List of symptom strings
        patient_info: Patient demographic information
        
    Returns:
        Analysis results with severity and recommendations
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Keep components focused and reusable

Example:
```tsx
interface PatientProps {
  name: string;
  age: number;
}

export default function PatientCard({ name, age }: PatientProps) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="font-bold">{name}</h3>
      <p className="text-gray-600">Age: {age}</p>
    </div>
  );
}
```

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Example:
```
Add symptom analysis API endpoint

- Implement POST /api/v1/diagnosis/analyze
- Add input validation
- Include unit tests
- Update API documentation

Fixes #123
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. Start the development servers
2. Test the affected features
3. Check for console errors
4. Verify responsive design

## 📚 Documentation

- Update README.md if you change functionality
- Add docstrings to new functions/classes
- Update API documentation for new endpoints
- Add comments for complex logic

## 🏷️ Issue and PR Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 🎨 Design Guidelines

### UI/UX Principles

1. **Simplicity** - Keep interfaces simple for rural users
2. **Offline-first** - Ensure functionality without internet
3. **Multilingual** - Support local languages
4. **Accessible** - Follow accessibility standards
5. **Mobile-friendly** - Optimize for mobile devices

### Color Scheme

- Primary: Green (#10b981) - Healthcare, growth
- Secondary: Blue - Trust, medical
- Alerts: Yellow/Orange - Warnings
- Critical: Red - Urgent actions

## 🌍 Localization

When adding user-facing text:

1. Add English text first
2. Mark for translation with i18n keys
3. Provide context for translators
4. Test in multiple languages

## 🔐 Security

- Never commit API keys or secrets
- Sanitize user input
- Follow OWASP guidelines
- Report security issues privately

## 📞 Getting Help

- Check existing documentation
- Search existing issues
- Ask in discussions
- Email: contact@arogya-swarm.in

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Arogya-Swarm! Together, we're improving rural healthcare. 🏥❤️
