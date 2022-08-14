#! /bin/bash

# # hojjat12/database-add-record:lambda4
# # hojjat12/database-delete-record:lambda2
# # hojjat12/database-get-records:lambda5
# # hojjat12/database-update-record:lambda3
# # awrmin/dotenx-http-call:lambda3
# # awrmin/create-jira-ticket:lambda3
# # awrmin/sendemail:lambda3
# # awrmin/slack-send-message:lambda3
# # stripe/stripe-create-customer:lambda3
# # stripe/stripe-find-customer:lambda3
# # stripe/stripe-update-customer:lambda3

# export region="us-east-1"
# export repository_name="hojjat12/database-add-record"
# export tag="lambda4"
# export directory_address="database-insert-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-delete-record"
# export tag="lambda2"
# export directory_address="database-delete-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-get-records"
# export tag="lambda5"
# export directory_address="database-select-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-update-record"
# export tag="lambda3"
# export directory_address="database-update-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/dotenx-http-call"
# export tag="lambda3"
# export directory_address="http-call"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/create-jira-ticket"
# export tag="lambda3"
# export directory_address="create-jira-ticket"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/sendemail"
# export tag="lambda3"
# export directory_address="send-email"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/slack-send-message"
# export tag="lambda3"
# export directory_address="slack-message"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-create-customer"
# export tag="lambda3"
# export directory_address="stripe-create-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-find-customer"
# export tag="lambda3"
# export directory_address="stripe-find-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-update-customer"
# export tag="lambda3"
# export directory_address="stripe-update-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

cd ../../../predefinedImages/tasks/${directory_address}
pwd
docker build -t ${image_name} .
docker tag ${image_name} 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} # this line can change based on the local image name
cd ../../../runner/executors/awsLambda
# aws ecr create-repository --repository-name ${repository_name} --image-scanning-configuration scanOnPush=false
# aws ecr get-login-password | docker login --username AWS --password-stdin 994147050565.dkr.ecr.${region}.amazonaws.com
docker push 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name}
# aws ecr set-repository-policy --repository-name ${repository_name} \
#     --policy-text file://policy.json --region ${region}
aws lambda create-function --function-name ${function_name} --package-type Image \
    --code ImageUri=994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} \
    --role arn:aws:iam::994147050565:role/lambda-ex --region ${region}
