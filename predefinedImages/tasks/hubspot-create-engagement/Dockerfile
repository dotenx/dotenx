FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-create-engagement

FROM alpine 

COPY --from=build /app/hubspot-create-engagement ./

CMD [ "/hubspot-create-engagement" ]