package utils

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"time"

	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"

	"github.com/dgrijalva/jwt-go"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

// Errors
var ErrReachLimitationOfPlan = errors.New("you have reached your limit. please upgrade your plan")
var ErrUserDatabaseNotFound = errors.New("database not found. this error occurs when your project has not database")
var ErrDatabaseJobResultAlreadyExists = errors.New("database job result already exists")
var ErrDatabaseJobIsPending = errors.New("datbase job status is pending")
var ErrIntegrationNotFound = errors.New("integration not found")
var ErrPageNotFound = errors.New("page not found")
var ErrUserNotFound = errors.New("user not found")
var ErrDomainNotAvailable = errors.New("domain isn't available")

// constants
const ForgetPasswordUseCase = "forget_password" // for security_code table (user management)
var GitIntegrationProviders = []string{"github", "gitlab", "bitbucket"}
var UserDatabaseDefaultTables = []string{"user_info", "user_group", "security_code", "views"}

func FailOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func GetAccountId(c *gin.Context) (string, error) {
	accountId, exist := c.Get("accountId")
	if !exist {
		return "", errors.New("account id not exists")
	}
	return accountId.(string), nil
}

// SpecialProviders are not supported by goth package (https://github.com/markbates/goth)
var SpecialProviders = []string{"slack", "instagram", "typeform", "ebay", "mailchimp", "airtable", "gumroad", "hubspot"}

// TODO: ADD COMMENT!
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

func GetUserGroup(tokenString string) (string, error) {
	claims, err := getClaims(tokenString)
	if err != nil {
		return "", err
	}
	if ug, ok := claims["user_group"]; ok {
		if userGroup, ok2 := ug.(string); ok2 {
			return userGroup, nil
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
		log.Println("Unexpected error occurred!")
		return "", err
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

// TODO: ADD COMMENT! Why are there magic strings in the code?
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

func Base64URLBytesEncode(str []byte) string {
	encoded := base64.StdEncoding.EncodeToString(str)
	encoded = strings.Replace(encoded, "+", "-", -1)
	encoded = strings.Replace(encoded, "/", "_", -1)
	encoded = strings.Replace(encoded, "=", "", -1)
	return encoded
}

// GenerateJwtToken function generates a jwt token based on HS256 algorithm
func GenerateTpJwtToken(accountId, tpAccountId, userGroup string) (accToken string, err error) {
	logrus.Debug("GenerateTpJwtToken ", accountId, tpAccountId, userGroup)
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["authorized"] = true
	claims["iss"] = "dotenx-ao-api"
	claims["account_id"] = accountId
	claims["tp_account_id"] = tpAccountId
	if len(userGroup) > 0 {
		claims["user_group"] = userGroup
	} else {
		claims["user_group"] = ""
	}
	claims["token_type"] = "tp"
	claims["exp"] = time.Now().Add(24 * time.Hour).Unix()

	// accToken, err = token.SignedString([]byte(config.Configs.App.JwtSecret))
	accToken, err = token.SignedString([]byte(config.Configs.Secrets.AuthServerJwtSecret))
	if err != nil {
		return "", err
	}

	return
}

// HashPassword function hashes a plain text password with bcrypt package and return result
func HashPassword(password string) (hashedPassword string, err error) {
	hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("unable to hash password")
	}

	hashedPassword = string(hashedPasswordBytes)
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

func CheckErrorExist(ctx *gin.Context, err error, statusCode int) bool {
	if err != nil {
		log.Println(err.Error())
		ctx.JSON(statusCode, gin.H{
			"message": err.Error(),
		})
		return true
	}
	return false
}

func ShouldRedirectWithError(ctx *gin.Context, err error, url string) bool {
	if err != nil {
		ctx.Redirect(http.StatusTemporaryRedirect, url+"?error="+err.Error())
		return true
	}
	return false
}

func CheckPermission(action, tableName string, userGroup *models.UserGroup) bool {
	list := map[string]string{}
	switch action {
	case "select":
		list = userGroup.Select
	case "insert":
		list = userGroup.Insert
	case "update":
		list = userGroup.Update
	case "delete":
		list = userGroup.Delete
	default:
		return false
	}
	if _, ok := list["*"]; ok {
		return true
	}
	_, ok := list[tableName]
	return ok
}

func GetThirdPartyAccountId(c *gin.Context) (tpAccountId string, err error) {
	tokenType, _ := c.Get("tokenType")
	if tokenType == "tp" {
		accId, _ := c.Get("tpAccountId")
		tpAccountId = fmt.Sprintf("%v", accId)
	} else {
		return "", errors.New("no tpAccountId have been set")
	}
	return tpAccountId, nil
}

func GetFromNestedJson(jsonBytes []byte, keys []string, index int) (interface{}, error) {
	// var values interface{}
	if index >= len(keys) {
		return nil, errors.New("index out of range")
	}
	var data map[string]interface{}
	err := json.Unmarshal(jsonBytes, &data)
	if err != nil {
		return nil, err
	}
	key := keys[index]
	keyIndex := -2
	pureIndex := ""
	if strings.Contains(key, "[") && strings.Contains(key, "]") {

		indexes := strings.Split(key, "[")
		pureIndex = indexes[0]
		tempIndex := strings.ReplaceAll(indexes[1], "]", "")
		if tempIndex == "*" {
			keyIndex = -1
		} else if intIndex, err := strconv.Atoi(tempIndex); err == nil {
			keyIndex = intIndex
		} else {
			return nil, errors.New("index is not defined correctly")
		}
	} else if _, ok := data[key].([]interface{}); ok {
		keyIndex = -1
		pureIndex = key
	} else {
		pureIndex = key
	}

	newValue, ok := data[pureIndex]
	if !ok {
		log.Println("#######################")
		log.Println(data)
		log.Println(pureIndex)
		log.Println("#######################")
		return nil, errors.New("key not found")
	}
	if index+1 >= len(keys) {
		if keyIndex == -2 { // no index
			// values = append(values, newValue)
			return newValue, nil
		} else if keyIndex == -1 { // all index
			// TODO handle panic scenario
			tempValues := make([]interface{}, 0)
			tempValues = append(tempValues, newValue.([]interface{})...)
			return tempValues, nil
		} else { // specific index
			// TODO handle panic scenario
			newValues := newValue.([]interface{})
			if keyIndex >= len(newValues) {
				return nil, errors.New("index out of range")
			}
			// values = append(values, newValues[keyIndex])
			return newValues[keyIndex], nil
		}

	} else {
		if keyIndex == -2 { // no index
			newJsonBytes, err := json.Marshal(newValue)
			if err != nil {
				return nil, err
			}
			return GetFromNestedJson(newJsonBytes, keys, index+1)
		} else if keyIndex == -1 { // all index
			// TODO handle panic scenario
			tempValues := make([]interface{}, 0)
			for _, v := range newValue.([]interface{}) {
				newJsonBytes, err := json.Marshal(v)
				if err != nil {
					return nil, err
				}
				returnedValues, err := GetFromNestedJson(newJsonBytes, keys, index+1)
				if err != nil {
					return nil, err
				}
				tempValues = append(tempValues, returnedValues)
			}
			return tempValues, nil
		} else { // specific index
			// TODO handle panic scenario
			newValues := newValue.([]interface{})
			if keyIndex >= len(newValues) {
				return nil, errors.New("index out of range")
			}
			newJsonBytes, err := json.Marshal(newValues[keyIndex])
			if err != nil {
				return nil, err
			}
			returnedValues, err := GetFromNestedJson(newJsonBytes, keys, index+1)
			if err != nil {
				return nil, err
			}
			// values = append(values, returnedValues...)
			return returnedValues, nil
		}
	}
}

func GetFlatOfArray(values []interface{}) (interface{}, error) {
	if len(values) == 0 {
		return values, nil
	}
	// if len(values) == 1 {
	// 	return values[0], nil
	// }
	valuesString := make([]string, 0)
	for _, value := range values {
		_, err := json.Marshal(value)
		if _, ok := value.(map[string]interface{}); ok && err == nil {
			valueBytes, _ := json.Marshal(removeNils(value.(map[string]interface{})))
			valuesString = append(valuesString, string(valueBytes))
		} else {
			valuesString = append(valuesString, fmt.Sprint(value))
		}
	}
	return strings.TrimSuffix(strings.Join(valuesString, ","), ","), nil
}

func removeNils(initialMap map[string]interface{}) map[string]interface{} {
	withoutNils := map[string]interface{}{}
	for key, value := range initialMap {
		_, ok := value.(map[string]interface{})
		if ok {
			value = removeNils(value.(map[string]interface{}))
			withoutNils[key] = value
			continue
		}
		if value != nil {
			withoutNils[key] = value
		}
	}
	return withoutNils
}

func GetFlatOfInterface(values interface{}, ended *bool) interface{} {
	var result interface{}
	if jsonField, isJson := values.(map[string]interface{}); isJson {
		result = make(map[string]interface{})
		for key, val := range jsonField {
			flatValue := GetFlatOfInterface(val, ended)
			result.(map[string]interface{})[key] = flatValue
		}
		return result
	} else if reflect.TypeOf(values) != nil && (reflect.TypeOf(values).Kind() == reflect.Array || reflect.TypeOf(values).Kind() == reflect.Slice) {
		arrayField := values.([]interface{})
		if len(arrayField) == 0 {
			return ""
		}
		*ended = false
		hasJsonField := false
		for _, val := range arrayField {
			if _, ok := val.(map[string]interface{}); ok {
				hasJsonField = true
				break
			}
		}

		if hasJsonField {
			result = make(map[string]interface{})
			for _, val := range arrayField {
				nestedJsonField, ok := val.(map[string]interface{})
				if !ok {
					continue
				}
				for nestedKey, nestedValue := range nestedJsonField {
					if result.(map[string]interface{})[nestedKey] == nil {
						result.(map[string]interface{})[nestedKey] = make([]interface{}, 0)
					}
					flatValue := GetFlatOfInterface(nestedValue, ended)
					result.(map[string]interface{})[nestedKey] = append(result.(map[string]interface{})[nestedKey].([]interface{}), flatValue)
				}
			}
		} else {
			result, _ = GetFlatOfArray(arrayField)
		}
		return result
	} else {
		return values
	}
}

func GetMD5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}
