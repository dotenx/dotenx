FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-create-ticket

FROM alpine 

COPY --from=build /app/hubspot-create-ticket ./

CMD [ "/hubspot-create-ticket" ]