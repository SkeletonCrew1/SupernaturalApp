package sendmail

import (
	"encoding/json"
	"log"
	"mail_sending/config"
	"mail_sending/mail"
	"net/http"

	_ "github.com/joho/godotenv/autoload"
)

type MailData struct {
	TargetStatus []string `json:"TargetStatus"`
	Subject      string   `json:"Subject"`
	BodyText     string   `json:"BodyText"`
}

func SendMail(
	w http.ResponseWriter,
	r *http.Request,
) {
	var emailData MailData
	var users []User

	err := json.NewDecoder(r.Body).Decode(&emailData) //decode json into go struct
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}
	if len(emailData.TargetStatus) == 0 {
		http.Error(
			w,
			"Status required(Cupper,silver,golden)",
			http.StatusBadRequest,
		)
		return
	}
	if emailData.Subject == "" {
		http.Error(
			w,
			"Subject can not be empty",
			http.StatusBadRequest,
		)
		return
	}
	if emailData.BodyText == "" {
		http.Error(
			w,
			"Subject can not be empty",
			http.StatusBadRequest,
		)
		return
	}
	result := config.DB.Where("status IN ?", emailData.TargetStatus).Find(&users)
	if result.Error != nil {
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	for _, user := range users {
		err := mail.SendCustomdMail(user.Email, user.Status, emailData.Subject, emailData.BodyText)
		if err != nil {
			log.Print("email not send ", err)
		} else {
			log.Print("email send ", user.Email)

		}

	}

}
