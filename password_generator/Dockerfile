# Build stage
FROM golang:1.26.5-alpine AS build
WORKDIR /password_generator
COPY go.mod go.sum main.go ./
RUN go build -o main

# Runtime stage
FROM alpine:3.23.5
WORKDIR /password_generator
COPY --from=build /password_generator/main ./
CMD ["/password_generator/main"]
