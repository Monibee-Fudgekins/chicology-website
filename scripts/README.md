# Scripts

Helper scripts for the AI website automation system.

## Available Scripts

### `run_tests.mjs`
Runs basic validation tests on the built website.

```bash
npm test
```

Tests include:
- Build output validation
- Content structure checks
- Functions existence verification

### `create_daily_update.mjs`
Creates a daily update blog post for a given date.

```bash
# Create today's update
node scripts/create_daily_update.mjs

# Create update for specific date
node scripts/create_daily_update.mjs 2026-01-19
```

## For AI Workers

If you are an AI worker trying to automate this repository:

1. **Health Checks**: Use `/__health` endpoint to report your status
2. **Daily Updates**: Use `scripts/create_daily_update.mjs` to create blog posts
3. **Testing**: Always run `npm test` after changes
4. **Building**: Run `npm run build` to generate static site
5. **Validation**: Run `npm run lint && npm run typecheck` before committing

## Success Criteria

For successful automation:
- [ ] Build must succeed (`npm run build`)
- [ ] Tests must pass (`npm test`)
- [ ] Linting must pass (`npm run lint`)
- [ ] Type checking must pass (`npm run typecheck`)
- [ ] Changes should be minimal and focused
- [ ] Commit messages should be clear and descriptive
