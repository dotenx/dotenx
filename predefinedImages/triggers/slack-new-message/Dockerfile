FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN go build -o ./slack-new-message

FROM alpine 

COPY --from=build /app/slack-new-message ./

CMD [ "./slack-new-message" ]