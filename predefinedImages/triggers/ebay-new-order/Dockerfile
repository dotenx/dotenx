FROM golang:1.17-alpine as build

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN go build -o ./ebay-new-order

FROM alpine 

COPY --from=build /app/ebay-new-order ./

CMD [ "./ebay-new-order" ]