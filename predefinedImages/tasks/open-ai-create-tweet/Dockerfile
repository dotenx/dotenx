FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./open-ai-create-tweet

FROM alpine 

COPY --from=build /app/open-ai-create-tweet ./

CMD [ "/open-ai-create-tweet" ]