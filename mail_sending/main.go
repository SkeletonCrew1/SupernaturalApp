package main

import (
	"encoding/json"
	"log"
	"mail_sending/config"
	sendmail "mail_sending/send_mail"

	"net/http"

	"github.com/joho/godotenv"
	_ "github.com/joho/godotenv/autoload"

	"github.com/rs/cors"
)

type User struct {
	ID     uint `gorm:"primaryKey"`
	Alias  string
	Email  string
	Status string
}

type MailData struct {
	TargetStatus []string `json:"TargetStatus"`
	Subject      string   `json:"Subject"`
	BodyText     string   `json:"BodyText"`
}

type InviteData struct {
	Email string `json:"email"`
}

func init() {
	err := godotenv.Load()
	if err != nil {
	}
}

// Health check for k8s
func WriteResponseToJSON(w http.ResponseWriter, status int, payload map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	WriteResponseToJSON(w, http.StatusOK, map[string]any{"status": "ok"})

}

func main() {
	_, err := config.ConnectDB()
	if err != nil {
		log.Fatal("Error db not connected")

	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /mail", sendmail.SendMail)
	mux.HandleFunc("POST /mail_password", sendmail.SendDailyPassword)
	mux.HandleFunc("POST /inquisitor_mail", sendmail.SendInquisitorMail)
	mux.HandleFunc("POST /invite", sendmail.CreateInvite)
	// Health check for k8s
	mux.HandleFunc("GET /health", HealthCheck)

	log.Println("server listening to  port 8074")
	log.Fatal(http.ListenAndServe(":8074", CORS(mux))) // can be used like ListenAndServeTLS

}
func CORS(next http.Handler) http.Handler {
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://frontend-service:8080", "http://general-service:4040"},
		AllowedMethods:   []string{"POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})
	return c.Handler(next)
}
