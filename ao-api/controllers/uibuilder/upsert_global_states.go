package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	UpsertGlobalStates handler handles set or overwrite name of ui page global states,
	this handler get states from body of request and save those in ui_builder_global_states table
*/

func (controller *UIbuilderController) UpsertGlobalStates() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")

		type GlobalStateDTO struct {
			States []string `json:"states" required:"true"`
		}

		var statesDTO GlobalStateDTO
		if err := c.ShouldBindJSON(&statesDTO); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		globalState := models.GlobalState{
			AccountId:   accountId,
			ProjectName: projectName,
			States:      statesDTO.States,
		}
		err := controller.Service.UpsertGlobalStates(globalState)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "states was changed successfully",
		})
		return
	}
}
