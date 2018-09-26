#!/usr/bin/env bash
# ==================================================================================================
# This script is meant for quickly deploying new API code to AWS during development and testing.
# All it does is package the code and deploy it to AWS Lambda.  It doesn't lint or test the code first,
# nor does it bump any version numbers or commit anything to Git.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Re-build
./scripts/build.sh

echo
echo Packaging the code...
package_file="$(npm run package --silent)"

echo Deploying the code to AWS Lambda...
json="$(
  aws lambda update-function-code \
    --function-name SuperTechHeroesLambda  \
    --zip-file fileb://${package_file}
)"

echo Done!

# echo
# echo "${json}"

