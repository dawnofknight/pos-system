# Fixing Vercel Deployment Error

## The Problem

Vercel deployment is failing with:
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date
```

This happened because we added Capacitor dependencies for Android, but didn't update the `pnpm-lock.yaml` file.

## Quick Fix (Recommended)

Run this script to automatically fix the issue:

```bash
./fix-vercel.sh
```

Then commit and push:

```bash
git add pnpm-lock.yaml package.json
git commit -m "fix: update pnpm lockfile for Vercel deployment"
git push
```

## Manual Fix

If you prefer to do it manually:

### Option 1: Using pnpm (Recommended)

```bash
# Install pnpm if not installed
npm install -g pnpm

# Remove old lockfile
rm pnpm-lock.yaml

# Regenerate lockfile
pnpm install

# Commit and push
git add pnpm-lock.yaml package.json
git commit -m "fix: update pnpm lockfile"
git push
```

### Option 2: Using npm (Alternative)

If you prefer npm over pnpm:

```bash
# Remove pnpm lockfile
rm pnpm-lock.yaml

# Install with npm (will use package-lock.json)
npm install

# Vercel will detect package-lock.json instead
git add package.json package-lock.json
git rm pnpm-lock.yaml
git commit -m "fix: switch to npm for Vercel deployment"
git push
```

## Why This Happened

When we added these dependencies for Android Bluetooth printing:
- `@capacitor/android@^7.4.4`
- `@capacitor/core@^7.4.4`
- `@capacitor/cli@^7.4.4`
- `typescript@^5.9.3`
- `prop-types@^15.8.1`

The `package.json` was updated, but `pnpm-lock.yaml` wasn't regenerated.

## Note About Capacitor Dependencies

**Important**: Capacitor dependencies are only needed for mobile (Android) builds, not for the web deployment on Vercel.

If you want to keep your Vercel deployment lighter, you could:

1. **Keep both**: Use the lockfile update (recommended, simplest)
2. **Split dependencies**: Move Capacitor to `devDependencies` if you only deploy web to Vercel

## After Fixing

Once you push the updated lockfile, Vercel will automatically:
1. Detect the new `pnpm-lock.yaml`
2. Install dependencies correctly
3. Build and deploy successfully

The web app will work normally on Vercel (without Bluetooth printing, which is Android-only).

## Troubleshooting

**"pnpm not found"**
- Run: `npm install -g pnpm`
- Or use the npm alternative above

**Still failing on Vercel**
- Check Vercel build logs
- Verify `pnpm-lock.yaml` is committed and pushed
- Try clearing Vercel build cache

**Want to test locally first**
```bash
pnpm install
pnpm build
```

If local build works, Vercel will work too.
