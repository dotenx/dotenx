FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./stripe-new-invoice

FROM alpine 

COPY --from=build /app/stripe-new-invoice ./

CMD [ "/stripe-new-invoice" ]