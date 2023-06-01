FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-new-deal

FROM alpine 

COPY --from=build /app/hubspot-new-deal ./

CMD [ "/hubspot-new-deal" ]