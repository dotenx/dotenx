FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-new-contact

FROM alpine 

COPY --from=build /app/hubspot-new-contact ./

CMD [ "/hubspot-new-contact" ]