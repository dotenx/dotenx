FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./new-record

FROM alpine 

COPY --from=build /app/new-record ./

CMD [ "/new-record" ]