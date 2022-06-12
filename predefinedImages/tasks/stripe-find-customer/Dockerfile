FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./stripe-find-customer

FROM alpine 

COPY --from=build /app/stripe-find-customer ./

CMD [ "/stripe-find-customer" ]