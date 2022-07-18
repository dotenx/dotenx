#! /bin/bash

export region="us-east-1"
export function_name="hojjat12-youtube-upload-file-lambda"
export repository_name="hojjat12/youtube-upload-file"
export image_name="hojjat12/youtube-upload-file:lambda"

##### only once
# aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
# aws iam attach-role-policy --role-name lambda-ex --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
#####


aws ecr create-repository --repository-name ${repository_name} --image-scanning-configuration scanOnPush=false
docker tag ${image_name} 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} # this line can change based on the local image name
aws ecr get-login-password | docker login --username AWS --password-stdin 994147050565.dkr.ecr.${region}.amazonaws.com
docker push 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name}

aws ecr set-repository-policy --repository-name ${repository_name} \
    --policy-text file://policy.json --region ${region}


aws lambda create-function --function-name ${function_name} --package-type Image \
    --code ImageUri=994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} \
    --role arn:aws:iam::994147050565:role/lambda-ex --region ${region}



#### invokation
aws lambda invoke --function-name ${function_name} \
    --cli-binary-format raw-in-base64-out \
    --payload '{ "key": "value" }' response.json --region ${region} --log-type Tail \
--query 'LogResult' --output text |  base64 -d
