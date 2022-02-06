FROM golang:1.14.7 AS go-build

ARG GITLAB_ACCESS_USERNAME
ARG GITLAB_ACCESS_PASSWORD
RUN echo https://${GITLAB_ACCESS_USERNAME}:${GITLAB_ACCESS_PASSWORD}@gitlab.com >> ~/.git-credentials && \ 
            git config --global credential.helper 'store --file ~/.git-credentials'

ENV GO111MODULE=on
WORKDIR /go/src/github.com/utopiops/automated-ops/ao-api

COPY go.mod .


ENV GOPRIVATE=gitlab.com/utopiops-water/*

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o ao-api .

FROM alpine:3.9.5
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-build /go/src/github.com/utopiops/automated-ops/ao-api .
ENTRYPOINT ["./ao-httpCall"]