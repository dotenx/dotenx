#! /bin/bash

export region="us-east-1"
export function_name="hojjat12-typeform-new-response-lambda2"
export repository_name="hojjat12/typeform-new-response"
export image_name="hojjat12/typeform-new-response:lambda2"

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

# # New AWS Lambda payload:
# {
#     "body": {
#         "0": {
#             "INTEGRATION_ACCESS_TOKEN": "",
#             "INTEGRATION_REFRESH_TOKEN": "",
#             "sender": "",
#             "message": ""
#         },
#         "1": {
#             "INTEGRATION_ACCESS_TOKEN": "",
#             "INTEGRATION_REFRESH_TOKEN": "",
#             "sender": "",
#             "message": ""
#         }
#     },
#     "RESULT_ENDPOINT": "",
#     "WORKSPACE": "",
#     "AUTHORIZATION": ""
# }

# # old inner body (trigger):
# {
#     "created_time": "",
#     "message": "",
#     "id": ""
# }

# # new inner body (trigger):
# {
#     "0": {
#         "created_time": "",
#         "message": "",
#         "id": ""
#     },
#     "1": {
#         "created_time": "",
#         "message": "",
#         "id": ""
#     },
#     "2": {
#         "created_time": "",
#         "message": "",
#         "id": ""
#     }
# }

# # old outputs tasks:
# {
#     "customer_id": "",
#     "customer_name": ""
# }

# # new outputs tasks:
# {
#     "0": {
#         "customer_id": "",
#         "customer_name": ""
#     },
#     "1": {
#         "customer_id": "",
#         "customer_name": ""
#     },
#     "2": {
#         "customer_id": "",
#         "customer_name": ""
#     }
# }