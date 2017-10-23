#!/usr/bin/env bash
# ==================================================================================================
# This script builds the API schemas in the "lib/schemas" folder.  The Swagger 2.0 schema is considered
# the "master" schema from which all other schemas are generated.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo Building API schemas...
swagger2openapi --yaml lib/schemas/swagger.yaml > lib/schemas/openapi.yaml
yaml2json --pretty lib/schemas/swagger.yaml > lib/schemas/swagger.json
yaml2json --pretty lib/schemas/openapi.yaml > lib/schemas/openapi.json
