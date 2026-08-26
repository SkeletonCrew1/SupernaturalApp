# Build stage
FROM golang:1.26.5-alpine AS build
WORKDIR /auth
COPY go.mod go.sum main.go utils.go session.go ./
RUN go build -o main

# Runtime stage
FROM alpine:3.23.5
WORKDIR /auth
COPY --from=build /auth/main ./
CMD ["./main"]
