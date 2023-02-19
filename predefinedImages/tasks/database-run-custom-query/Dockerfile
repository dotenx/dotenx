FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./run-custom-query

FROM alpine 

COPY --from=build /app/run-custom-query ./

CMD [ "/run-custom-query" ]