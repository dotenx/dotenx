FROM golang:1.16-alpine AS go-build

ENV GO111MODULE=on

WORKDIR /go/src/github.com/dotenx/dotenx/ao-api

ENV GONOSUMDB=gitlab.com/utopiops-water

COPY ./ao-api/go.mod .
COPY ./ao-api/go.sum .

RUN go mod download
COPY ./triggers ./triggers
COPY ./tasks ./tasks
COPY ./integrations ./integrations

COPY ./ao-api .






RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build 
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o ao-api .

FROM alpine:3.9.5 as dns
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-build /go/src/github.com/dotenx/dotenx/ao-api .
ENTRYPOINT ["./ao-api"]