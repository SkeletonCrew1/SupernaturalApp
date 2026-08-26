package sendmail

import (
	"encoding/json"
	"log"
	"mail_sending/mail"
	"net/http"

	_ "github.com/joho/godotenv/autoload"
)

type InquisitorMailRequest struct {
	Email string `json:"email"`
	Alias string `json:"alias"`
	Type string `json:"type"`
}

func SendInquisitorMail(
	w http.ResponseWriter,
	r *http.Request,
) {
	var inquisitorMail InquisitorMailRequest

	err := json.NewDecoder(r.Body).Decode(&inquisitorMail) //decode json into go struct
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}
	if inquisitorMail.Email == "" {
		http.Error(
			w,
			"Subject can not be empty",
			http.StatusBadRequest,
		)
		return
	}
	if inquisitorMail.Alias == "" {
		http.Error(
			w,
			"Subject can not be empty",
			http.StatusBadRequest,
		)
		return
	}

	err = mail.SendInquisitorMail(inquisitorMail.Email, inquisitorMail.Alias, inquisitorMail.Type)
	if err != nil {
		log.Print("email not send ", err)
	} else {
		log.Print("email send ", inquisitorMail.Email)
	}
}
