package utils

import (
	"log"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
)

func FailOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func GetAccountId(c *gin.Context) (string, error) {
	/*session := sessions.Default(c)
	accountId, ok := session.Get("accountId").(string)
	if !ok {
		return "", errors.New("you need to login first")
	}
	return accountId, nil*/
	return config.Configs.App.AccountId, nil
}
