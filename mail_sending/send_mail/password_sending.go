package sendmail

import (
	"encoding/json"
	"log"
	"mail_sending/config"
	"mail_sending/mail"
	"net/http"

	_ "github.com/joho/godotenv/autoload"
)

type User struct {
	ID     uint `gorm:"primaryKey"`
	Alias  string
	Email  string
	Status string
}

type SiteProtection struct {
	SitePassword string `json:"password"`
}

func SendDailyPassword(
	w http.ResponseWriter,
	r *http.Request,
) {
	var users []User
	var sitePassword SiteProtection
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := json.NewDecoder(r.Body).Decode(&sitePassword) //decode json into go struct
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}
	if sitePassword.SitePassword == "" {
		http.Error(
			w,
			"Subject can not be empty",
			http.StatusBadRequest,
		)
		return
	}

	result := config.DB.Find(&users)
	if result.Error != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
	for _, user := range users {
		err := mail.SendPasswordMail(user.Email, user.Status, user.Alias, sitePassword.SitePassword)
		if err != nil {
			log.Print("email not send ", err)
		} else {
			log.Print("email send ", user.Email)

		}

	}

}
