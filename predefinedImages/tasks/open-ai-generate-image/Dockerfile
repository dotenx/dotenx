FROM golang:1.16-alpine as build
 
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./open-ai-generate-image

FROM alpine 

COPY --from=build /app/open-ai-generate-image ./

CMD [ "/open-ai-generate-image" ]