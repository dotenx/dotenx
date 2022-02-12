package shared

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/dgrijalva/jwt-go"
	"github.com/utopiops/automated-ops/runner/config"
)

type AuthHelper struct {
	token      string
	HttpHelper HttpHelper
	mux        sync.Mutex
}

func (aus *AuthHelper) Register() (err error) {
	method := http.MethodPost
	url := config.Configs.Endpoints.Core + "/auth/apps/register"
	headers := []Header{
		{
			Key:   "appName",
			Value: config.Configs.Secrets.AppName,
		},
		{
			Key:   "secret",
			Value: config.Configs.Secrets.AuthServerJwtSecret,
		},
	}
	_, err, statusCode := aus.HttpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		fmt.Println("Status code: ", statusCode)
		err = fmt.Errorf("request failed: %d", statusCode)
		return
	}
	return
}

func (aus *AuthHelper) setToken() (err error) {
	method := http.MethodPost
	url := config.Configs.Endpoints.Core + "/auth/apps/token"
	headers := []Header{
		{
			Key:   "appName",
			Value: config.Configs.Secrets.AppName,
		},
		{
			Key:   "secret",
			Value: config.Configs.Secrets.AuthServerJwtSecret,
		},
	}
	body, err, statusCode := aus.HttpHelper.HttpRequest(method, url, nil, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		err = fmt.Errorf("request failed: %d", statusCode)
		return
	}

	var t struct {
		Token string
	}

	err = json.Unmarshal(body, &t)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	aus.token = t.Token
	return
}

func (aus *AuthHelper) GetToken() (token string, err error) {
	aus.mux.Lock()
	defer aus.mux.Unlock()
	if aus.token != "" {
		secret := []byte(config.Configs.Secrets.AuthServerJwtSecret)

		// Parse takes the token string and a function for looking up the key. The latter is especially
		// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
		// head of the token to identify which key to use, but the parsed token (head and claims) is provided
		// to the callback, providing flexibility.
		t, err := jwt.Parse(aus.token, func(token *jwt.Token) (interface{}, error) {
			// Validate the alg is what you expect:
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"]) // This would be a serious issue cause the auth server has changed the alg
			}
			return secret, nil
		})
		if err != nil {
			fmt.Println(err.Error())
			return "", err
		}
		if t.Valid {
			return aus.token, nil
		}
	}
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		err = aus.setToken()
	}()
	wg.Wait()
	if err != nil {
		return
	}
	token = aus.token
	return
}
