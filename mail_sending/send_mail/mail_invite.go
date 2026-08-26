package sendmail

import (
	"encoding/json"
	"fmt"
	"log"
	"mail_sending/mail"

	"net/http"
	netmail "net/mail"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/joho/godotenv/autoload"
)

type InviteData struct {
	Email string `json:"email"`
}

var jwtSecret = []byte(os.Getenv("JWT_KEY"))

func CreateInviteJWT(email string) (string, error) {
	claims := jwt.MapClaims{
		"sub": email,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}

func CreateInvite(
	w http.ResponseWriter,
	r *http.Request,
) {
	var emailData InviteData
	err := json.NewDecoder(r.Body).Decode(&emailData) //decode json into go struct
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	if emailData.Email == "" {
		http.Error(
			w,
			"Email is required",
			http.StatusBadRequest,
		)
		return
	}

	if _, err := netmail.ParseAddress(emailData.Email); err != nil {
		http.Error(w, "invalid email format", http.StatusBadRequest) // 400
		return
	}

	token, err := CreateInviteJWT(emailData.Email)

	if err != nil {
		http.Error(w, "could not create invite token", http.StatusInternalServerError) // 500
		return
	}

	link := fmt.Sprintf("http://127.0.0.1:8080/api/auth/invite/%s", token)

	err = mail.SendInvite(emailData.Email, link)
	if err != nil {
		log.Print("email not send ", err)
	} else {
		log.Print("email send ", emailData.Email)
	}
}
