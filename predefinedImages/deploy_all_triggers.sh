#! /bin/bash

# # awrmin/google-new-email:lambda6
# # hojjat12/dropbox-upload-new-file:lambda4
# # hojjat12/ebay-new-order:lambda4
# # hojjat12/facebook-publish-new-post:lambda5
# # awrmin/slack-new-message:lambda5
# # awrmin/stripe-new-invoice:lambda4
# # awrmin/stripe-payment-completed:lambda6
# # hojjat12/twitter-new-tweet:lambda5
# # hojjat12/typeform-new-response:lambda5
# # hojjat12/mailchimp-new-subscriber:lambda
# # hojjat12/mailchimp-new-unsubscriber:lambda
# # hojjat12/airtable-new-record:lambda
# # hojjat12/gumroad-new-sale:lambda
# # hojjat12/gumroad-new-subscriber:lambda
# # hojjat12/hubspot-new-contact:lambda
# # hojjat12/hubspot-new-deal:lambda
# # hojjat12/hubspot-new-ticket:lambda
# # hojjat12/hubspot-new-form-submission:lambda
# # hojjat12/hubspot-new-email-event:lambda

# export region="us-east-1"
# export repository_name="awrmin/google-new-email"
# export tag="lambda6"
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
# export tag="lambda4"
# export directory_address="ebay-new-order"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/facebook-publish-new-post"
# export tag="lambda5"
# export directory_address="facebook-publish-new-post"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="awrmin/slack-new-message"
# export tag="lambda5"
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
# export tag="lambda6"
# export directory_address="stripe-payment-completed"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/twitter-new-tweet"
# export tag="lambda5"
# export directory_address="twitter-new-tweet"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/typeform-new-response"
# export tag="lambda5"
# export directory_address="typeform-new-response"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/mailchimp-new-subscriber"
# export tag="lambda"
# export directory_address="mailchimp-new-subscriber"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/mailchimp-new-unsubscriber"
# export tag="lambda"
# export directory_address="mailchimp-new-unsubscriber"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/airtable-new-record"
# export tag="lambda"
# export directory_address="airtable-new-record"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/gumroad-new-sale"
# export tag="lambda"
# export directory_address="gumroad-new-sale"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/gumroad-new-subscriber"
# export tag="lambda"
# export directory_address="gumroad-new-subscriber"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-new-contact"
# export tag="lambda"
# export directory_address="hubspot-new-contact"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-new-deal"
# export tag="lambda"
# export directory_address="hubspot-new-deal"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-new-ticket"
# export tag="lambda"
# export directory_address="hubspot-new-ticket"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-new-form-submission"
# export tag="lambda"
# export directory_address="hubspot-new-form-submission"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

# export region="us-east-1"
# export repository_name="hojjat12/hubspot-new-email-event"
# export tag="lambda"
# export directory_address="hubspot-new-email-event"
# export image_name="${repository_name}:${tag}"
# export function_name=$(echo $image_name | sed 's/\//-/g' | sed 's/:/-/g')
# echo $image_name
# echo $function_name

cd triggers/${directory_address}
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
