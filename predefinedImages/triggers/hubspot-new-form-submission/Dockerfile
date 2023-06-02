FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./hubspot-new-form-submission

FROM alpine 

COPY --from=build /app/hubspot-new-form-submission ./

CMD [ "/hubspot-new-form-submission" ]