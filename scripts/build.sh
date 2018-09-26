#!/usr/bin/env bash
# ==================================================================================================
# This script builds the API schemas in the "schemas" folder.  The Swagger 2.0 schema is considered
# the "master" schema from which all other schemas are generated.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo Building website...
babel docs/js/src --out-dir docs/js/dist --presets=latest,stage-3,react
simplifyify docs/js/dist/index.js --outfile docs/js/super-tech-heroes.js --bundle --minify --debug
rm -rf docs/js/dist

echo Building API schemas...
swagger2openapi --yaml schemas/swagger.yaml > schemas/openapi.yaml
yaml2json --pretty schemas/swagger.yaml > schemas/swagger.json
yaml2json --pretty schemas/openapi.yaml > schemas/openapi.json

echo Done building
