#!/usr/bin/env bash
# ==================================================================================================
# This script builds a new Docker image and publishes it to DockerHub, tagged with the current
# version number
# ==================================================================================================

# Stop on first error
set -o errexit -o nounset -o pipefail

# Get package info from package.json
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")

echo
echo Building Docker image...
build_output="$(
  docker image build \
    --tag bigstickcarpet/super-tech-heroes:${version} \
    --tag bigstickcarpet/super-tech-heroes:latest .
)"

echo
echo Publishing v${version} to Docker...
push_version_output="$(
  docker image push bigstickcarpet/super-tech-heroes:${version}
)"
push_latest_output="$(
  docker image push bigstickcarpet/super-tech-heroes:latest
)"

# echo
# echo "${build_output}"
# echo "${push_version_output}"
# echo "${push_latest_output}"
