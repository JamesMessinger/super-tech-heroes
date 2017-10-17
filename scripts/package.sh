#!/usr/bin/env bash
# ==================================================================================================
# This script packages the API ode and dependencies into a .zip file that can be published to AWS Lambda.
# It DOES NOT actually publish the package to AWS.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Get package info from package.json
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")

# Delete any previously-packaged code
rm -rf package

# Package the current code
package_file="$(npm pack)"
tar -xf "$package_file"
rm "$package_file"

# Zip the package contents
cd package
zip_file="${name}_v${version}.zip"
zip -rq0 "$zip_file" .
cd ..

# Remove everything in the package directory except the zip file
mv package .package
mkdir -p package
mv ".package/$zip_file" package
rm -rf .package

# Output the full path of the zip file
echo $(pwd)/package/${zip_file}
