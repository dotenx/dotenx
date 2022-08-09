package crud

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

// ONLY FOR interaction and template pipelines
func (mc *CRUDController) SetUserGroups() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		pipeline, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		if !pipeline.IsInteraction && !pipeline.IsTemplate {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline type"})
			return
		}

		var input struct {
			UserGroups []string `json:"userGroups" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userGroups is required"})
			return
		}

		err = mc.Service.SetUserGroups(pipeline.PipelineDetailes.Id, input.UserGroups)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
	}
}
