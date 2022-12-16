#!/bin/sh
# Check if the AWS_LAMBDA_RUNTIME_API is not set. This environment
# variable is set when the image is running on Lambda.
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  # We know the image is being run off of Lambda, so we need to use the RIE
  # to start the function.
  exec /usr/bin/aws-lambda-rie ./node_modules/.bin/aws-lambda-ric $1
else
  # We know the image is being run on Lambda so we don't need to use the RIE.
  exec ./node_modules/.bin/aws-lambda-ric $1
fi  