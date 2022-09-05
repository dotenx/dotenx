package crud

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

/*

This handler is used to set the is_public property of an interaction pipeline.
This handler is used only for interaction pipelines.

*/

func (mc *CRUDController) SetInteractionAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)
		pipeline, err := mc.Service.GetPipelineByName(accountId, name, projectName)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		if !pipeline.IsInteraction {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot set access to a non-interaction pipeline"})
			return
		}

		var input struct {
			IsPublic bool `json:"isPublic"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		err = mc.Service.SetInteractionAccess(pipeline.PipelineDetailes.Id, input.IsPublic)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
	}
}
