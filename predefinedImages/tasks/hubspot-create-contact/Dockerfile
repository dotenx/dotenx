FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-create-contact

FROM alpine 

COPY --from=build /app/hubspot-create-contact ./

CMD [ "/hubspot-create-contact" ]