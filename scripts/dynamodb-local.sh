#!/usr/bin/env bash
# ==================================================================================================
# This script runs a local instance of AWS DynamoDB using Docker.
#
# NOTE: You must have Docker installed and be logged-in via the Docker CLI
# ==================================================================================================

# Use our local DynamoDB server, rather than AWS
export AWS_DYNAMODB_HOST="localhost"
export AWS_DYNAMODB_PORT="9090"

# Check if the docker container is already running
running_container="$(docker ps | grep dwmkerr/dynamodb)"

if [ -n "$running_container" ]; then
  echo DynamoDB is already running at http://localhost:9090/shell
else
  echo Starting DynamoDB server...
  docker run -d -p 9090:8000 dwmkerr/dynamodb

  echo Creating DynamoDB schema...
  json="$(
    aws dynamodb create-table \
      --table-name SuperTechHeroes.Characters \
      --attribute-definitions \
            AttributeName=id,AttributeType=S \
      --key-schema AttributeName=id,KeyType=HASH \
      --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
      --endpoint-url http://localhost:9090
  )"

  echo Done!
  echo DynamoDB is now running at http://localhost:9090/shell
fi
