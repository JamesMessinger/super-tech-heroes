#!/usr/bin/env bash
# ==================================================================================================
# This script is meant for quickly deploying new API code to AWS during development and testing.
# All it does is package the code and deploy it to AWS Lambda.
#
# NOTE: This script DOES NOT run any linters or tests beforehand, and it DOES NOT create or update
#       any AWS Lambda versions or aliases or AWS API Gateway stages.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

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

