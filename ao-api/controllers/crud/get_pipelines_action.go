package crud

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
)

func (mc *CRUDController) GetPipelines() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		pipelines, err := mc.Service.GetPipelines(accountId)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, pipelines)
	}
}
