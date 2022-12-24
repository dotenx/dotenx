FROM golang:1.18-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./archive-subscriber

FROM alpine 

COPY --from=build /app/archive-subscriber ./

CMD [ "/archive-subscriber" ]