# syntax=docker/dockerfile:1

FROM golang:1.26-alpine AS build-stage

WORKDIR /cleanup

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o cleanup .

FROM alpine:3.23.5

WORKDIR /cleanup

COPY --from=build-stage /cleanup/cleanup ./

EXPOSE 8585

CMD [ "./cleanup" ]
