#!/usr/bin/env bash
# ==================================================================================================
# This script does a full release of the API and website to production. It runs linters and tests
# first, then deploys the latest code, bumps the version number in AWS Lambda, package.json, and
# Git, and updates the "Prod" alias.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Re-build schemas
npm run build

# Make sure the Git working directory is clean
./scripts/ensure-clean-git.sh

echo
echo Updating all dependencies...
npm run upgrade --silent

changes=$(git diff-index --name-only HEAD)
if [ -n "$changes" ]; then
  echo
  echo Committing updated dependencies...
  git commit --all -m "Updated dependencies" --quiet
fi

echo
echo Running ESLint...
npm run lint --silent

changes=$(git diff-index --name-only HEAD)
if [ -n "$changes" ]; then
  echo
  echo Committing ESLint audo-fixes...
  git commit --all -m "ESLint auto-fixes" --quiet
fi

echo
echo Running tests...
npm test --silent

# Bump the version number in package.json, Git, and AWS Lambda
npm run bump --silent

# Get the new version number from package.json
lambda_version=$(node -p "/^\d+\.\d+\.(\d+)$/.exec(require('./package.json').version)[1]")

echo
echo Aliasing v${lambda_version} as Prod...
json="$(
  aws lambda update-alias \
    --function-name SuperTechHeroesLambda \
    --function-version ${lambda_version} \
    --name Prod
)"

# echo
# echo "${json}"

echo
echo All Done!
