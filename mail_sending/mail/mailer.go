package mail

import (
	"bytes"
	"fmt"
	"html/template"
	"os"

	"gopkg.in/gomail.v2"
)

func SendPasswordMail(emailAddress string, userStatus string, userAlias string, sitePassword string) error {
	email_host := os.Getenv("EMAIL_HOST")
	email_from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	templateData := struct {
		Status       string
		SitePassword string
		Alias        string
	}{
		Status:       userStatus,
		SitePassword: sitePassword,
		Alias:        userAlias,
	}

	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		panic(fmt.Errorf("failed to parse template file: %w", err))
	}

	d := gomail.NewDialer(email_host, 587, email_from, password)

	var bodyBuffer bytes.Buffer
	if err := tmpl.Execute(&bodyBuffer, templateData); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "unown@gmail.com")
	m.SetHeader("To", emailAddress)
	m.SetHeader("Subject", "The cycle turns!")
	m.SetBody("text/html", bodyBuffer.String())

	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil

}

func SendCustomdMail(emailAddress string, userStatus string, subject string, bodyText string) error {
	email_host := os.Getenv("EMAIL_HOST")
	email_from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	templateData := struct {
		BodyText string
		Status   string
	}{
		BodyText: bodyText,
		Status:   userStatus,
	}

	tmpl, err := template.ParseFiles("templates/custom_index.html")
	if err != nil {
		panic(fmt.Errorf("failed to parse template file: %w", err))
	}

	d := gomail.NewDialer(email_host, 587, email_from, password)

	var bodyBuffer bytes.Buffer
	if err := tmpl.Execute(&bodyBuffer, templateData); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "unown@gmail.com")
	m.SetHeader("To", emailAddress)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", bodyBuffer.String())

	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil

}

func SendInvite(emailAddress string, link string) error {
	email_host := os.Getenv("EMAIL_HOST")
	email_from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	templateData := struct {
		Link string
	}{
		Link: link,
	}

	tmpl, err := template.ParseFiles("templates/invite.html")
	if err != nil {
		panic(fmt.Errorf("failed to parse template file: %w", err))
	}

	d := gomail.NewDialer(email_host, 587, email_from, password)

	var bodyBuffer bytes.Buffer
	if err := tmpl.Execute(&bodyBuffer, templateData); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "unown@gmail.com")
	m.SetHeader("To", emailAddress)
	m.SetHeader("Subject", "You have been chosen!")
	m.SetBody("text/html", bodyBuffer.String())

	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil

}

func SendInquisitorMail(emailAddress string, userAlias string, typeOfRole string) error {
	email_host := os.Getenv("EMAIL_HOST")
	email_from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")
	templateData := struct {
		UserAlias string
	}{
		UserAlias: userAlias,
	}

    tmpl, err := template.ParseFiles("templates/Inquisitor_index.html")
    if typeOfRole == "architect"{
	    tmpl, err = template.ParseFiles("templates/architect_index.html")
    }
	if err != nil {
		panic(fmt.Errorf("failed to parse template file: %w", err))
	}

	d := gomail.NewDialer(email_host, 587, email_from, password)

	var bodyBuffer bytes.Buffer
	if err := tmpl.Execute(&bodyBuffer, templateData); err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "unown@gmail.com")
	m.SetHeader("To", emailAddress)
	m.SetHeader("Subject", "THE CIRCLE")
	m.SetBody("text/html", bodyBuffer.String())

	if err := d.DialAndSend(m); err != nil {
		return err
	}
	return nil

}
