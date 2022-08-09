package execution

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (e *ExecutionController) StartPipelineByName() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		var tpAccountId, userGroup string
		if tt, ok := c.Get("tokenType"); ok && tt == "tp" {
			accId, _ := utils.GetThirdPartyAccountId(c)
			tpAccountId = fmt.Sprintf("%v", accId)
			ug, _ := c.Get("user_group") // We must always set the user_group claim even if it's empty
			userGroup = ug.(string)
		}

		name := c.Param("name")
		// Get the `input data` from the request body
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		res, err := e.Service.StartPipelineByName(input, accountId, name, tpAccountId, userGroup)
		if err != nil {
			logrus.Error(err.Error())
			switch err.Error() {
			case "you don't have permission to execute this interaction":
				c.Status(http.StatusForbidden)
				return
			case "automation is not active":
				c.JSON(http.StatusBadRequest, err.Error())
				return
			case "no value for this field in initial data or return values":
				c.JSON(http.StatusBadRequest, "some of your task fields are dependent on your trigger or needed to pass in at run time if you are running an interaction")
				return
			default:
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		}
		c.JSON(http.StatusOK, res)
	}
}
