FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./stripe-create-payment-link

FROM alpine 

COPY --from=build /app/stripe-create-payment-link ./

CMD [ "/stripe-create-payment-link" ]