# hadolint global ignore=DL3003,DL3006,SC1035 # We accept these issue
FROM golang:1.26.5-alpine AS build
WORKDIR /mail_service
COPY . .
RUN go build -o main

# Runtime stage
FROM alpine:3.23.5
WORKDIR /auth
RUN apk add --no-cache tzdata
COPY --from=build /mail_service/main ./
COPY --from=build /mail_service/templates ./templates
EXPOSE 8080
CMD ["./main"]
