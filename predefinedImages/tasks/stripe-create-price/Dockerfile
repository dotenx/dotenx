FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./stripe-create-price

FROM alpine 

COPY --from=build /app/stripe-create-price ./

CMD [ "/stripe-create-price" ]