#! /bin/bash

region="us-east-1"
function_name=$1
tag=lambda

##### only once
# aws iam create-role --role-name lambda-ex --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
# aws iam attach-role-policy --role-name lambda-ex --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
#####

aws ecr create-repository --repository-name ${function_name} --image-scanning-configuration scanOnPush=false --region ${region}
echo "repository created"
docker tag ${function_name}:${tag} 994147050565.dkr.ecr.${region}.amazonaws.com/${function_name}:${tag} # this line can change based on the local image name
echo "image tagged"
aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin 994147050565.dkr.ecr.${region}.amazonaws.com
echo "docker login"
echo "994147050565.dkr.ecr.${region}.amazonaws.com/${function_name}:${tag}"
docker push 994147050565.dkr.ecr.${region}.amazonaws.com/${function_name}:${tag}
echo "image pushed"

aws ecr set-repository-policy --repository-name ${function_name} \
    --policy-text file://policy.json --region ${region}
echo "policy set"

f_name=$(echo $function_name| sed 's/\//-/g')

aws lambda create-function --function-name ${f_name}-${tag} --package-type Image \
    --code ImageUri=994147050565.dkr.ecr.${region}.amazonaws.com/${function_name}:${tag} \
    --role arn:aws:iam::994147050565:role/lambda-ex --region ${region}
echo "function created"

#### invokation
# aws lambda invoke --function-name ${f_name}-${tag} \
#     --cli-binary-format raw-in-base64-out \
#     --payload '{ "key": "key", "VALUE": "value" }' response.json --region ${region} --log-type Tail \
# --query 'LogResult' --output text |  base64 -d
