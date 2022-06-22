package utils

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"time"

	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"

	"github.com/dgrijalva/jwt-go"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func FailOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func GetAccountId(c *gin.Context) (string, error) {
	if config.Configs.App.RunLocally {
		return config.Configs.App.AccountId, nil
	} else {
		accountId, exist := c.Get("accountId")
		if !exist {
			return "", errors.New("account id not exists")
		}
		return accountId.(string), nil
	}
}

var bytes = []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05}

func Encode(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func Decode(s string) []byte {
	data, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		panic(err)
	}
	return data
}

// Encrypt method is to encrypt or hide any classified text
func Encrypt(text, MySecret string) (string, error) {
	block, err := aes.NewCipher([]byte(MySecret))
	if err != nil {
		return "", err
	}
	plainText := []byte(text)
	cfb := cipher.NewCFBEncrypter(block, bytes)
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	return Encode(cipherText), nil
}

// Decrypt method is to extract back the encrypted text
func Decrypt(text, MySecret string) (string, error) {
	block, err := aes.NewCipher([]byte(MySecret))
	if err != nil {
		return "", err
	}
	cipherText := Decode(text)
	cfb := cipher.NewCFBDecrypter(block, bytes)
	plainText := make([]byte, len(cipherText))
	cfb.XORKeyStream(plainText, cipherText)
	return string(plainText), nil
}

func GetNewUuid() string {
	id := uuid.New()
	return id.String()
}

func GetAuthorizedField(tokenString string) (bool, error) {
	claims, err := getClaims(tokenString)
	if err != nil {
		return false, err
	}
	if authorizedField, hasAuthorizedField := claims["authorized"]; hasAuthorizedField {
		if authorizedFieldBool, isAuthorizedFieldBool := authorizedField.(bool); isAuthorizedFieldBool {
			return authorizedFieldBool, nil
		}
	}
	return false, errors.New("claim not found")
}

func GetAccountIdField(tokenString string) (string, error) {
	claims, err := getClaims(tokenString)
	if err != nil {
		return "", err
	}

	if accountIdField, hasAccountIdField := claims["account_id"]; hasAccountIdField {
		if accountIdFieldString, isAccountIdFieldString := accountIdField.(string); isAccountIdFieldString {
			return accountIdFieldString, nil
		}
	}
	return "", errors.New("claim not found")
}

func GetTpAccountIdField(tokenString string) (string, error) {
	claims, err := getClaims(tokenString)
	if err != nil {
		return "", err
	}
	if tpAccountIdField, hasTpAccountIdField := claims["tp_account_id"]; hasTpAccountIdField {
		if tpAccountIdFieldString, isTpAccountIdFieldString := tpAccountIdField.(string); isTpAccountIdFieldString {
			return tpAccountIdFieldString, nil
		}
	}
	return "", errors.New("claim not found")
}

func getClaims(tokenString string) (jwt.MapClaims, error) {
	secret := []byte(config.Configs.Secrets.AuthServerJwtSecret)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signature")
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, errors.New("invalid token")
	}
}

func GeneratToken() (string, error) {
	tokenString, err := GenerateJwtToken()
	if err != nil {
		return "", err
		log.Fatal("Unexpected error occurred!")
	}
	token := fmt.Sprintf("Bearer %s", tokenString)
	fmt.Printf("token:\n%s\n", token)
	return token, nil
}

// GenerateJwtToken function generates a jwt token based on HS256 algorithm
func GenerateJwtToken() (accToken string, err error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["authorized"] = true
	claims["iss"] = "dotenx-ao-api"
	claims["exp"] = time.Now().Add(6 * time.Hour).Unix()

	// accToken, err = token.SignedString([]byte(config.Configs.App.JwtSecret))
	accToken, err = token.SignedString([]byte(config.Configs.Secrets.AuthServerJwtSecret))
	if err != nil {
		return "", err
	}

	return
}

var FullRunes = []rune("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
var LowercaseRunes = []rune("0123456789abcdefghijklmnopqrstuvwxyz")

func RandStringRunes(n int, letterRunes []rune) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

// GenerateJwtToken function generates a jwt token based on HS256 algorithm
func GenerateTpJwtToken(accountId, tpAccountId string) (accToken string, err error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["authorized"] = true
	claims["iss"] = "dotenx-ao-api"
	claims["account_id"] = accountId
	claims["tp_account_id"] = tpAccountId
	claims["token_type"] = "third-party"
	claims["exp"] = time.Now().Add(6 * time.Hour).Unix()

	// accToken, err = token.SignedString([]byte(config.Configs.App.JwtSecret))
	accToken, err = token.SignedString([]byte(config.Configs.Secrets.AuthServerJwtSecret))
	if err != nil {
		return "", err
	}

	return
}

func ContainsString(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
