ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM golang:1.18-alpine AS go-build

ARG TARGETOS 
ARG TARGETARCH

RUN apk add build-base

ENV GO111MODULE=on

WORKDIR /go/src/github.com/dotenx/dotenx/ao-api

ENV GONOSUMDB=gitlab.com/utopiops-water

COPY ./ao-api/go.mod .
COPY ./ao-api/go.sum .

RUN go mod download
RUN go mod vendor

COPY ./triggers ./triggers
COPY ./tasks ./tasks
COPY ./integrations ./integrations

COPY ./ao-api .

RUN rm -r vendor
RUN CGO_ENABLED=1 GOOS=$TARGETOS GOARCH=$TARGETARCH go build
RUN CGO_ENABLED=1 GOOS=$TARGETOS go build -a -installsuffix cgo -o ao-api .

FROM alpine:3.9.5 as dns

RUN apk --no-cache add ca-certificates

RUN apk update \
    && apk add zip

RUN apk add --update nodejs npm \
  && npm --version

WORKDIR /root/
COPY --from=go-build /go/src/github.com/dotenx/dotenx/ao-api .
ENTRYPOINT ["./ao-api"]