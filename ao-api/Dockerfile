FROM golang:1.13.4 AS go-build

ENV GO111MODULE=on

ARG GITLAB_ACCESS_USERNAME
ARG GITLAB_ACCESS_PASSWORD
RUN echo https://${GITLAB_ACCESS_USERNAME}:${GITLAB_ACCESS_PASSWORD}@gitlab.com >> ~/.git-credentials && git config --global credential.helper 'store --file ~/.git-credentials'

WORKDIR /go/src/github.com/utopiops/automated-ops/ao-api

ENV GONOSUMDB=gitlab.com/utopiops-water
ENV GOPRIVATE=gitlab.com/utopiops-water/*

COPY ./ao-api/go.mod .
COPY ./ao-api/go.sum .

RUN go mod download
COPY ./triggers ./triggers
COPY ./tasks ./tasks
COPY ./ao-api .






RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build 
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o ao-api .

FROM alpine:3.9.5 as dns
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-build /go/src/github.com/utopiops/automated-ops/ao-api .
ENTRYPOINT ["./ao-api"]