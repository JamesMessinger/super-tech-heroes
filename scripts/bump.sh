#!/usr/bin/env bash
# ==================================================================================================
# This script publishes a new version of the API and website. It bumps the version number in
# package.json, Git, and AWS Lambda.
#
# NOTE: This script DOES NOT run any linters or tests beforehand, and it DOES NOT update the "Prod"
#       version of the Lambda alias or API Gateway stage.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Make sure the Git working directory is clean
./scripts/ensure-clean-git.sh

echo Bumping the version number in package.json...
npm_version="$(npm version patch)"

echo Packaging the code...
package_file="$(npm run package --silent)"

echo Publishing a new version to AWS Lambda...
json="$(
  aws lambda update-function-code \
    --function-name SuperTechHeroesLambda  \
    --zip-file fileb://${package_file} \
    --publish
)"

# Get the new Lambda version number
lambda_version="$(node -p "(${json}).Version")"

echo Pushing ${npm_version} to Git...
git push --quiet
git push --tags --quiet

echo Done!
