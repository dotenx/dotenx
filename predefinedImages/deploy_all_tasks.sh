#! /bin/bash

# # hojjat12/database-add-record:lambda6
# # hojjat12/database-delete-record:lambda4
# # hojjat12/database-get-records:lambda9
# # hojjat12/database-update-record:lambda6
# # hawwwdi/send-discord-message:lambda4
# # awrmin/dotenx-http-call:lambda6
# # hojjat12/facebook-publish-post:lambda4
# # hojjat12/google-send-email:lambda4
# # awrmin/create-jira-ticket:lambda5
# # hojjat12/sendgrid-send-email:lambda7
# # awrmin/slack-send-message:lambda6
# # hojjat12/starshipit-create-order:lambda3
# # stripe/stripe-create-customer:lambda5
# # stripe/stripe-find-customer:lambda5
# # stripe/stripe-update-customer:lambda5
# # hojjat12/twitter-send-tweet:lambda5
# # hojjat12/youtube-upload-file:lambda4
# # stripe/stripe-create-payment-link:lambda4
# # hojjat12/mailchimp-add-new-subscriber:lambda
# # hojjat12/mailchimp-archive-subscriber:lambda
# # hojjat12/airtable-create-record:lambda
# # hojjat12/stripe-create-product:lambda
# # hojjat12/stripe-update-product:lambda
# # hojjat12/stripe-create-price:lambda
# # hojjat12/database-run-custom-query:lambda
# # hojjat12/hubspot-create-contact:lambda
# # hojjat12/hubspot-create-deal:lambda
# # hojjat12/hubspot-create-company:lambda
# # hojjat12/hubspot-create-ticket:lambda

# export region="us-east-1"
# export repository_name="hojjat12/database-add-record"
# export tag="lambda6"
# export directory_address="database-insert-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-delete-record"
# export tag="lambda4"
# export directory_address="database-delete-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-get-records"
# export tag="lambda9"
# export directory_address="database-select-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-update-record"
# export tag="lambda6"
# export directory_address="database-update-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hawwwdi/send-discord-message"
# export tag="lambda4"
# export directory_address="discord-channel-message"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/dotenx-http-call"
# export tag="lambda6"
# export directory_address="http-call"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/facebook-publish-post"
# export tag="lambda4"
# export directory_address="facebook-publish-post"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/google-send-email"
# export tag="lambda4"
# export directory_address="google-send-email"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/create-jira-ticket"
# export tag="lambda5"
# export directory_address="create-jira-ticket"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/sendgrid-send-email"
# export tag="lambda7"
# export directory_address="sendgrid-send-email"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/slack-send-message"
# export tag="lambda6"
# export directory_address="slack-message"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/starshipit-create-order"
# export tag="lambda3"
# export directory_address="starshipit-create-order"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-create-customer"
# export tag="lambda5"
# export directory_address="stripe-create-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-find-customer"
# export tag="lambda5"
# export directory_address="stripe-find-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-update-customer"
# export tag="lambda5"
# export directory_address="stripe-update-customer"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/twitter-send-tweet"
# export tag="lambda5"
# export directory_address="twitter-send-tweet"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/youtube-upload-file"
# export tag="lambda4"
# export directory_address="youtube-upload-file/awsLambda"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="stripe/stripe-create-payment-link"
# export tag="lambda4"
# export directory_address="stripe-create-payment-link"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/mailchimp-add-new-subscriber"
# export tag="lambda"
# export directory_address="mailchimp-add-new-subscriber"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/mailchimp-archive-subscriber"
# export tag="lambda"
# export directory_address="mailchimp-archive-subscriber"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/airtable-create-record"
# export tag="lambda"
# export directory_address="airtable-create-record"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/stripe-create-product"
# export tag="lambda"
# export directory_address="stripe-create-product"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/stripe-update-product"
# export tag="lambda"
# export directory_address="stripe-update-product"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/stripe-create-price"
# export tag="lambda"
# export directory_address="stripe-create-price"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/database-run-custom-query"
# export tag="lambda"
# export directory_address="database-run-custom-query"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-create-contact"
# export tag="lambda"
# export directory_address="hubspot-create-contact"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-create-deal"
# export tag="lambda"
# export directory_address="hubspot-create-deal"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-create-company"
# export tag="lambda"
# export directory_address="hubspot-create-company"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-create-ticket"
# export tag="lambda"
# export directory_address="hubspot-create-ticket"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

cd tasks/${directory_address}
pwd
docker build -t ${image_name} .
docker tag ${image_name} 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} # this line can change based on the local image name
cd ../..
# aws ecr create-repository --repository-name ${repository_name} --image-scanning-configuration scanOnPush=false
# aws ecr get-login-password | docker login --username AWS --password-stdin 994147050565.dkr.ecr.${region}.amazonaws.com
docker push 994147050565.dkr.ecr.${region}.amazonaws.com/${image_name}
# aws ecr set-repository-policy --repository-name ${repository_name} \
#     --policy-text file://policy.json --region ${region}
aws lambda create-function --function-name ${function_name} --package-type Image \
    --code ImageUri=994147050565.dkr.ecr.${region}.amazonaws.com/${image_name} \
    --role arn:aws:iam::994147050565:role/lambda-ex --region ${region} --timeout 15
