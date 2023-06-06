FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-new-email-event

FROM alpine 

COPY --from=build /app/hubspot-new-email-event ./

CMD [ "/hubspot-new-email-event" ]