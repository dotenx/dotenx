package middlewares

import (
	"errors"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func TokenTypeMiddleware(types []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.Configs.App.RunLocally {
			c.Next()
			return
		}
		tokenType, exist := c.Get("tokenType")
		logrus.Debug("token type:", tokenType)
		logrus.Debug("types:", types)
		if !exist {
			err := errors.New("missing type field of token")
			logrus.Debug(err)
			c.AbortWithError(http.StatusForbidden, err)
			return
		}
		if tokenType == "external" && utils.ContainsString(types, "user") {
			c.Next()
			return
		}
		if tokenType == "tp" && utils.ContainsString(types, "tp") {
			c.Next()
			return
		}

		err := errors.New("access denied")
		logrus.Debug(err)
		c.AbortWithError(http.StatusForbidden, err)
		return
	}
}
