FROM alpine:latest as alp

RUN apk --no-cache add ca-certificates

RUN apk update \
    && apk add aws-cli

RUN aws --version

RUN apk update \
    && apk add postgresql \
    && apk add postgresql-client \
    && apk add openssl \
    && apk add zip \
    && apk add bash

RUN psql -V

COPY bash.sh bash.sh

ENTRYPOINT ["bash", "bash.sh"]
