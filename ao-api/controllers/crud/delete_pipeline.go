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
		tokenType, _ := c.Get("tokenType")
		if tokenType == "tp" {
			pipeline, err := mc.Service.GetPipelineByName(accountId, name, projectName)
			if err != nil {
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
			tpAccountId, _ := utils.GetThirdPartyAccountId(c)
			if pipeline.CreatedFor != tpAccountId {
				c.Status(http.StatusForbidden)
				return
			}
		}
		err := mc.Service.DeletePipeline(accountId, name, projectName, false)
		if err != nil {
			logrus.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}
