package config

const (
	DOTENX_API_URL      string = "https://api.dotenx.com"
	AWS_REGION          string = "us-east-1"
	AWS_LAMBDA_ROLE_ARN string = "arn:aws:iam::994147050565:role/lambda-ex"
	AWS_S3_BUCKET_NAME  string = "dotenx-tasks-and-triggers-manifests-qoi44zleu34o23u4kji"
)

const (
	GO_SAM_TEMPLATE string = `
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: A serverless application
Globals:
    Function:
        Timeout: 10
        Handler: main.go
        Runtime: go1.x
        Tracing: Active
        Layers:
            - !FindInMap [RegionMap, !Ref "AWS::Region", layer]

Resources:
    ServiceFunction:
        Type: AWS::Serverless::Function
        Properties:
            CodeUri: service/
            Events:
                Service:
                    Type: Api
                    Properties:
                        Path: /
                        Method: post

Outputs:
    ServiceApi:
        Description: "API Gateway endpoint URL for Prod stage for service function"
        Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
`
)
