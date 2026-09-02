package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func main() {
	// Init database connection
	var err error
	db, err = connectDB()
	if err != nil {
		log.Fatal(err)
	}

	// Close database connection when main exits
	defer db.Close()

	err = rotatePassword(db)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Password rotated successfully")
}

func connectDB() (*sql.DB, error) {
	db, err := sql.Open("postgres", os.Getenv("DSN"))
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func rotatePassword(db *sql.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Disable current password
	_, err = tx.Exec(
		"UPDATE website_passwords SET is_active = false WHERE is_active = true",
	)
	if err != nil {
		return err
	}

	// Create new password
	password := PasswordGenerator(20)

	// Send password to mail service
	err = sendPassword(password)
	if err != nil {
		return err
	}

	// Hash password
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return err
	}

	// Store hashed password
	_, err = tx.Exec(
		"INSERT INTO website_passwords (password, is_active) VALUES ($1, $2)",
		hashedPassword,
		true,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func PasswordGenerator(passwordLength int) string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	// Variable for storing password
	password := make([]byte, passwordLength)

	// Initialize the random number generator
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// Generate password character by character
	for i := range password {
		password[i] = chars[rng.Intn(len(chars))]
	}
	log.Println(string(password))
	return string(password)

}

func sendPassword(password string) error {
	resp, err := http.Post(
		"http://mail-service:8074/mail_password",
		"application/json",
		bytes.NewBufferString(fmt.Sprintf(`{"password":"%s"}`, password)),
	)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}
