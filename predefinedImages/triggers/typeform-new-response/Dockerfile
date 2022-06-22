FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./submit-new-response

FROM alpine 

COPY --from=build /app/submit-new-response ./

CMD [ "/submit-new-response" ]