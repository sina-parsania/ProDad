# Contributing to ProDad

Thank you for considering a contribution to the ProDad project! This document outlines the process for contributing to the project and the standards we expect from contributors.

## Development Workflow

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Code Style

ProDad uses ESLint and Prettier to maintain consistent code style. Before submitting a pull request, please ensure your code passes linting:

```bash
npm run lint
```

## Commit Message Guidelines

ProDad follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. This standard helps maintain a clear and readable project history, automates versioning, and generates changelogs.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `build`: Changes to the build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit
- `wip`: Work in progress (should not be in final PRs)

### Examples

```
feat: add document upload functionality
fix(calendar): correct timezone handling for events
docs: update installation instructions in README
style: format code with prettier
refactor: simplify reminder creation flow
perf: optimize dashboard loading time
test: add tests for authentication flow
build: update React to version 19
ci: add automated deployment workflow
chore: update dependencies
revert: revert commit "feat: add notifications"
```

### Tips for Good Commit Messages

1. **Be specific**: "fix: button click event" is less helpful than "fix: prevent duplicate form submission on button click"
2. **Separate changes**: Make each commit a logical unit of change
3. **Use present tense**: Write "fix" not "fixed"
4. **Reference issues**: Include "Fixes #123" in the body or footer to automatically close issues

## Pull Request Process

1. Update documentation if necessary
2. Update tests if necessary
3. Ensure all tests pass
4. Get approval from at least one maintainer
5. Your PR will be merged by a maintainer

## Questions?

If you have any questions about contributing, please open an issue for discussion.

Thank you for your contributions! 