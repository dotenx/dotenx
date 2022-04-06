FROM golang:1.16-alpine

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY *.go ./

RUN go build -o ./sendDiscordMessage

FROM alpine

COPY --from=0 /app/sendDiscordMessage ./

CMD [ "./sendDiscordMessage" ]