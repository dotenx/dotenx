FROM alpine:3.17 as alp

RUN apk --no-cache add ca-certificates

RUN apk update \
    && apk add aws-cli

RUN aws --version

RUN apk update \
    && apk add postgresql \
    && apk add postgresql-client \
    && apk add openssl

RUN psql -V

COPY bash.sh bash.sh

ENTRYPOINT ["sh", "bash.sh"]
