FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./medium-create-story

FROM alpine 

COPY --from=build /app/medium-create-story ./

CMD [ "/medium-create-story" ]