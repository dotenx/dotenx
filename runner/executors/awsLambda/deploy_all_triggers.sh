#! /bin/bash

# # awrmin/google-new-email:lambda4
# # hojjat12/dropbox-upload-new-file:lambda4
# # hojjat12/ebay-new-order:lambda3
# # hojjat12/facebook-publish-new-post:lambda4
# # awrmin/slack-new-message:lambda4
# # awrmin/stripe-new-invoice:lambda4
# # awrmin/stripe-payment-completed:lambda4
# # hojjat12/twitter-new-tweet:lambda4
# # hojjat12/typeform-new-response:lambda4

# export region="us-east-1"
# export repository_name="awrmin/google-new-email"
# export tag="lambda4"
# export directory_address="google-new-email"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/dropbox-upload-new-file"
# export tag="lambda4"
# export directory_address="dropbox-upload-new-file"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/ebay-new-order"
# export tag="lambda3"
# export directory_address="ebay-new-order"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/facebook-publish-new-post"
# export tag="lambda4"
# export directory_address="facebook-publish-new-post"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/slack-new-message"
# export tag="lambda4"
# export directory_address="slack-new-message"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/stripe-new-invoice"
# export tag="lambda4"
# export directory_address="stripe-new-invoice"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/stripe-payment-completed"
# export tag="lambda4"
# export directory_address="stripe-payment-completed"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/twitter-new-tweet"
# export tag="lambda4"
# export directory_address="twitter-new-tweet"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/typeform-new-response"
# export tag="lambda4"
# export directory_address="typeform-new-response"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

cd ../../../predefinedImages/triggers/${directory_address}
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
