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

### Auto-merge Not Working?

1. **Check repository settings**: Ensure "Allow auto-merge" is enabled
2. **Check branch protection**: Verify rules don't prevent auto-merge
3. **Check required status checks**: Ensure all required checks are passing
4. **Check permissions**: Ensure the workflow has sufficient permissions

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
