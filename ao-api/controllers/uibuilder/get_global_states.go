package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	GetGlobalStates handler get name of ui page global states from ui_builder_global_states table
	and return those as response of request
*/

func (controller *UIbuilderController) GetGlobalStates() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectName := c.Param("project_name")

		globalState, err := controller.Service.GetGlobalStates(accountId, projectName)
		if err != nil && err.Error() == "states not found" {
			logrus.Error(err.Error())
			c.JSON(http.StatusNotFound, gin.H{
				"message": err.Error(),
			})
			return
		}
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"states": globalState.States,
		})
		return
	}
}
