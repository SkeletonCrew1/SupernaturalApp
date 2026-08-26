package main

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func generateRandomName() string {
	var adjectives = []string{
		"Swift", "Brave", "Clever", "Quiet", "Bright", "Shadowy", "Wild", "Calm",
		"Bold", "Gentle", "Fearless", "Mighty", "Nimble", "Lucky", "Curious", "Wise",
		"Silent", "Fierce", "Radiant", "Frosty", "Sunny", "Stormy", "Shining", "Glowing",
		"Ancient", "Mystic", "Hidden", "Rapid", "Soaring", "Daring", "Lively", "Noble",
		"Playful", "Steady", "Humble", "Vivid", "Whispering", "Distant", "Emerald", "Crimson",
		"Azure", "Ivory", "Scarlet", "Amber", "Verdant", "Cobalt", "Sapphire", "Pearl",
		"Crystal", "Obsidian", "Moonlit", "Starry", "Dusky", "Dawn", "Twilight", "Echoing",
		"Majestic", "Valiant", "Gallant", "Charming", "Serene", "Boundless", "Endless", "Blooming",
	}

	var nouns = []string{
		"Fox", "Shadow", "Eagle", "Wolf", "River", "Falcon", "Bear", "Lion", "Hawk", "Knight",
		"Tiger", "Panther", "Otter", "Raven", "Owl", "Lynx", "Badger", "Bison", "Stag", "Moose",
		"Phoenix", "Dragon", "Griffin", "Pegasus", "Unicorn", "Wyvern", "Hydra", "Sprite",
		"Comet", "Meteor", "Star", "Moon", "Sun", "Aurora", "Breeze", "Storm", "Thunder", "Rain",
		"Leaf", "Oak", "Pine", "Maple", "Cedar", "Willow", "Forest", "Meadow", "Mountain", "Valley",
		"Ocean", "Wave", "Brook", "Lake", "Summit", "Canyon", "Glacier", "Harbor", "Island", "Cave",
		"Blaze", "Ember", "Flame", "Spark", "Echo", "Whisper", "Dream", "Spirit", "Guardian", "Voyager",
		"Ranger", "Scout", "Wanderer", "Seeker", "Pathfinder", "Champion", "Sentinel", "Nomad", "Sage", "Voyage",
	}

	for {
		adjIndex, _ := rand.Int(rand.Reader, big.NewInt(int64(len(adjectives))))
		nounIndex, _ := rand.Int(rand.Reader, big.NewInt(int64(len(nouns))))
		return fmt.Sprintf("%s %s", adjectives[adjIndex.Int64()], nouns[nounIndex.Int64()])
	}
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var jwtSecret = []byte(os.Getenv("JWT_KEY"))

func createJWT(id int) (string, error) {
	claims := jwt.MapClaims{
		"sub": id,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}

func parseJWT(tokenString string) (int, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return 0, AuthError
	}

	claims := token.Claims.(jwt.MapClaims)

	return int(claims["sub"].(float64)), nil
}

func parseInviteJWT(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims := token.Claims.(jwt.MapClaims)

	return claims["sub"].(string), nil
}
