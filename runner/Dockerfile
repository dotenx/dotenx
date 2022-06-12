FROM golang:1.14.7 AS go-build

ENV GO111MODULE=on
WORKDIR /go/src/github.com/dotenx/dotenx/runner

COPY go.mod .
COPY go.sum .


ENV GOPRIVATE=gitlab.com/utopiops-water/*

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o runner .

FROM alpine:3.9.5
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-build /go/src/github.com/dotenx/dotenx/runner .
ENTRYPOINT ["./runner"]