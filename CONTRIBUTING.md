# Contributing Guide

## Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run database migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Code Style
- Follow Prettier configuration
- Use ESLint rules
- Write meaningful commit messages
- Add tests for new features

## Pull Request Process
1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Update documentation
5. Submit PR with description

## Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance
