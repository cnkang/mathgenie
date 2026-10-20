# Dependabot Auto-merge Configuration

This document explains how the Dependabot auto-merge workflow works and how to ensure it's properly configured.

## How It Works

Our Dependabot workflow automatically analyzes dependency update PRs and enables auto-merge for safe updates:

- **Patch updates**: Always auto-merged (bug fixes and security updates)
- **Minor updates (dev dependencies)**: Auto-merged (new features in development tools)
- **Minor updates (production dependencies)**: Requires manual review
- **Major updates**: Always requires manual review

## Repository Requirements

For auto-merge to work properly, ensure the following repository settings:

### 1. Enable Auto-merge Feature

1. Go to your repository settings
2. Navigate to "General" → "Pull Requests"
3. Check "Allow auto-merge"

### 2. Configure Branch Protection (Optional but Recommended)

If you have branch protection rules on `main`:

1. Go to "Settings" → "Branches"
2. Edit the protection rule for `main`
3. Ensure the following are configured:
   - "Require status checks to pass before merging" (recommended)
   - Add required status checks (e.g., CI workflow)
   - "Require branches to be up to date before merging" (optional)

### 3. Required Status Checks

The auto-merge will wait for these checks to pass:

- ✅ Dependabot CI (linting, tests, build, security audit)
- ✅ Any other required status checks configured in branch protection

## Workflow Behavior

### Safe Updates (Auto-merged)

- Patch updates: `1.2.3` → `1.2.4`
- Minor dev dependency updates: `1.2.0` → `1.3.0` (for `devDependencies`)

### Manual Review Required

- Major updates: `1.0.0` → `2.0.0`
- Minor production dependency updates: `1.2.0` → `1.3.0` (for `dependencies`)

## Troubleshooting

### Vite+ and Vitest Coverage Updates

Vite+ bundles a specific Vitest version. `@vitest/coverage-v8` must be pinned
to that exact version, including the patch number. For example, Vite+ 1.3.0
bundles Vitest 5.0.5 and requires coverage 5.0.5; coverage 5.0.3 fails at startup.

Dependabot groups the Vite+ toolchain, but a group can update coverage without
updating Vite+. The npm configuration therefore ignores automatic updates to
`@vitest/coverage-v8`. This is a compatibility constraint, not a security waiver:
review coverage security advisories and upgrade the toolchain together when needed.

When upgrading Vite+:

1. Check the Vitest version bundled by the selected Vite+ release.
2. Pin `@vitest/coverage-v8` to that exact version and regenerate `pnpm-lock.yaml`
   with `pnpm install`.
3. Run `pnpm install --frozen-lockfile` and `pnpm test:unit:ci`. The latter enables
   coverage and checks provider compatibility; tests without coverage are insufficient.
4. Require the PR's Tests check to pass before merging. Keep the coverage version
   pin and Dependabot ignore rule when upgrading.

### React and React-Dom Version Parity

React requires the `react` and `react-dom` packages to have the **exact same
version**. A mismatch makes React throw at module load time:

```
Error: Incompatible React versions: The "react" and "react-dom" packages must
have the exact same version. Instead got:
  - react:      19.3.1
  - react-dom:  19.3.0
```

Because the check runs while `react-dom` is imported, the whole application fails
to render. Unit tests report every test file as failed, and the Playwright suites
time out waiting for the first heading instead of failing fast.

The npm configuration therefore groups `react`, `react-dom`, `@types/react` and
`@types/react-dom`, so Dependabot always upgrades them together. A range such as
`^19.3.0` is not enough on its own: it already allows the newer `react-dom`, so
Dependabot sees no manifest change for it and the lockfile keeps the stale
version.

When upgrading React:

1. Bump `react` and `react-dom` to the same version in `package.json`.
2. Regenerate `pnpm-lock.yaml` with `pnpm install` and confirm the lockfile
   resolves `react-dom` to the same version as `react`.
3. Run `pnpm install --frozen-lockfile` and `pnpm test:unit:ci`.
4. Require the PR's Tests check to pass before merging.

### Auto-merge Not Working?

1. **Check repository settings**: Ensure "Allow auto-merge" is enabled
2. **Check branch protection**: Verify rules don't prevent auto-merge
3. **Check required status checks**: Ensure all required checks are passing
4. **Wait for other workflows**: GitHub reports an `unstable` state while it is still computing mergeability (for example, when the main `CI` workflow is running cross-browser tests). The Dependabot workflow now polls for a stable state, but if the error persists, confirm every required check has completed.
5. **Check permissions**: Ensure the workflow has sufficient permissions

### Common Error Messages

- **"Auto-merge is not enabled for this repository"**: Enable auto-merge in repository settings
- **"Branch protection rules may prevent auto-merge"**: Review branch protection configuration
- **"Insufficient permissions"**: Check workflow permissions in `.github/workflows/dependabot.yml`

## Manual Override

If auto-merge fails or is not available, you can safely merge eligible PRs manually:

1. Verify the PR passed all CI checks
2. Review the Dependabot analysis comment
3. Merge using the "Squash and merge" option

## Security

The workflow only enables auto-merge for:

- Dependency updates from Dependabot
- PRs that pass all CI checks
- Updates classified as "safe" (patch and minor dev dependencies)

Major updates and production dependency minor updates always require manual review to ensure compatibility and prevent breaking changes.
