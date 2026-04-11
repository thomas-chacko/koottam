# CI/CD Setup Guide

## How It Works (Simple Explanation)

Think of it like a chain reaction:

1. **You push code to development** → This starts `ci.yml`
2. **ci.yml tests your code** → If tests pass, it sends a signal to `auto-merge.yml`
3. **auto-merge.yml merges to main** → This triggers `deploy.yml`
4. **deploy.yml deploys your app** → Only deploys what changed

## How Files Trigger Each Other

### Step 1: ci.yml starts
```
You: git push origin development
     ↓
GitHub sees: "New code in development branch"
     ↓
Runs: ci.yml
```

### Step 2: ci.yml triggers auto-merge.yml
```
ci.yml finishes successfully
     ↓
Last step in ci.yml sends signal: "auto-merge-to-main"
     ↓
auto-merge.yml is listening for this signal
     ↓
Runs: auto-merge.yml
```

**How?** Look at these lines:

In `ci.yml` (sends signal):
```yaml
- name: Trigger auto-merge
  uses: peter-evans/repository-dispatch@v3
  with:
    event-type: auto-merge-to-main  # Sends this signal
```

In `auto-merge.yml` (receives signal):
```yaml
on:
  repository_dispatch:
    types: [auto-merge-to-main]  # Listens for this signal
```

### Step 3: auto-merge.yml triggers deploy.yml
```
auto-merge.yml merges development → main
     ↓
GitHub sees: "New code in main branch"
     ↓
Runs: deploy.yml
```

**How?** Look at this line in `deploy.yml`:
```yaml
on:
  push:
    branches:
      - main  # Runs when main branch gets new code
```

## The 3 Workflow Files

### 1. ci.yml (Test & Build)
**When:** You push to `development` branch
**What it does:**
- Downloads your code
- Installs packages (npm ci)
- Runs tests (npm test)
- Builds your app (npm run build)
- If everything passes → sends signal to auto-merge.yml

### 2. auto-merge.yml (Merge to Main)
**When:** Receives signal from ci.yml
**What it does:**
- Switches to main branch
- Merges development into main
- Pushes to GitHub
- This push triggers deploy.yml

### 3. deploy.yml (Deploy to Production)
**When:** Code is pushed to `main` branch
**What it does:**
- Checks what changed (server or client)
- If server changed → Deploy to Render
- If client changed → Deploy client
- If both changed → Deploy both

## Setup Instructions

### 1. GitHub Repository Settings

Enable GitHub Actions:
- Go to Settings → Actions → General
- Allow "Read and write permissions" for GITHUB_TOKEN
- Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Configure Secrets

Add these secrets in Settings → Secrets and variables → Actions:

#### For Server Deployment (Render)
```
RENDER_DEPLOY_HOOK_URL
```
Get this from Render:
1. Go to your Render service dashboard
2. Settings → Deploy Hook
3. Copy the webhook URL

#### For Client Deployment (Optional)
```
CLIENT_DEPLOY_HOOK_URL
```
Configure based on your hosting platform:
- **Vercel:** Use Vercel CLI or deploy hooks
- **Netlify:** Use build hooks
- **Other:** Add custom deployment logic

### 3. Branch Protection (Recommended)

Protect the `main` branch:
- Settings → Branches → Add rule
- Branch name pattern: `main`
- Enable:
  - Require status checks to pass before merging
  - Require branches to be up to date before merging

## Complete Flow Diagram

```
YOU
 │
 │ git push origin development
 ▼
┌──────────────────────────────────────────┐
│  ci.yml (Test & Build)                   │
│  ✓ Install packages                      │
│  ✓ Run server tests                      │
│  ✓ Run client tests                      │
│  ✓ Build server                          │
│  ✓ Build client                          │
│  ✓ Send signal: "auto-merge-to-main"    │
└──────────────┬───────────────────────────┘
               │
               │ (signal)
               ▼
┌──────────────────────────────────────────┐
│  auto-merge.yml (Merge)                  │
│  ✓ Merge development → main              │
│  ✓ Push to GitHub                        │
└──────────────┬───────────────────────────┘
               │
               │ (push to main)
               ▼
┌──────────────────────────────────────────┐
│  deploy.yml (Deploy)                     │
│  ✓ Check what changed                    │
│  ✓ Deploy server (if changed)            │
│  ✓ Deploy client (if changed)            │
└──────────────────────────────────────────┘
               │
               ▼
         PRODUCTION 🚀
```

## Testing the Setup

1. Create a test branch from development:
   ```bash
   git checkout development
   git checkout -b test-ci
   ```

2. Make a small change and push:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: CI/CD pipeline"
   git push origin test-ci
   ```

3. Merge to development and watch the workflows run:
   ```bash
   git checkout development
   git merge test-ci
   git push origin development
   ```

4. Check Actions tab in GitHub to see the pipeline execute

## Troubleshooting

### Tests fail on CI but pass locally
- Check Node.js version matches (v20)
- Ensure all dependencies are in package.json
- Check for environment-specific issues

### Auto-merge doesn't trigger
- Verify GITHUB_TOKEN has write permissions
- Check workflow logs for errors
- Ensure development branch is not protected

### Deployment doesn't trigger
- Verify secrets are configured correctly
- Check if changes were detected in correct paths
- Review deploy workflow logs

## Customization

### Change deployment platforms
Edit `.github/workflows/deploy.yml` and update the deployment steps for your platform.

### Add more environments
Create additional workflow files for staging, QA, etc.

### Modify test commands
Update the test steps in `development-ci.yml` to match your testing setup.
