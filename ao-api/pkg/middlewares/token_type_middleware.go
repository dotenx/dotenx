package middlewares

import (
	"errors"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func TokenTypeMiddleware(types []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.Configs.App.RunLocally {
			c.Next()
			return
		}
		tokenType, exist := c.Get("tokenType")
		if !exist {
			err := errors.New("missing type field of token")
			c.AbortWithError(http.StatusForbidden, err)
			return
		}
		log.Println("token type:", tokenType)
		if tokenType == "external" && utils.ContainsString(types, "user") {
			c.Next()
			return
		}
		if tokenType == "third-party" && utils.ContainsString(types, "third-party") {
			c.Next()
			return
		}

		err := errors.New("access denied")
		c.AbortWithError(http.StatusForbidden, err)
		return
	}
}
