package crud

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (mc *CRUDController) DeletePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)
		err := mc.Service.DeletePipeline(accountId, name, projectName, false)
		if err != nil {
			logrus.Println(err)
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, nil)

	}
}
