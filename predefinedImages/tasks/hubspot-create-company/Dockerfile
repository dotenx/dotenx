FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-create-company

FROM alpine 

COPY --from=build /app/hubspot-create-company ./

CMD [ "/hubspot-create-company" ]