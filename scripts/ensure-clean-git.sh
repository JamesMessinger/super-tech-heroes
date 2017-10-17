#!/usr/bin/env bash
# ==================================================================================================
# This script ensures that the Git working directory is clean. Otherwise, it exits with a non-zero
# exit code.
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

echo
echo Checking your Git working directory...
git update-index -q --ignore-submodules --refresh

if ! git diff-files --quiet --ignore-submodules --; then
    echo You have unstaged changes in your Git working tree
    exit 1
fi

if ! git diff-index --cached --quiet HEAD --ignore-submodules --; then
    eccho You have uncommitted changes in your Git index
    exit 1
fi
