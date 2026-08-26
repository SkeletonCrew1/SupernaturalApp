package main

import (
	"errors"
	"net/http"
)

var AuthError = errors.New("unauthorized")

func Authorize(r *http.Request) (int, error) {
	cookie, err := r.Cookie("jwt")
	if err != nil || cookie.Value == "" {
		return 0, AuthError
	}

	userID, err := parseJWT(cookie.Value)
	if err != nil {
		return 0, AuthError
	}

	return userID, nil
}
