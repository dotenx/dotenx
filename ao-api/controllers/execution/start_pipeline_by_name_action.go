package execution

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) StartPipelineByName() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		var tpAccountId string
		if tp, ok := c.Get("tokenType"); ok && tp == "tp" {
			accId, _ := utils.GetThirdPartyAccountId(c)
			tpAccountId = fmt.Sprintf("%v", accId)
		}
		name := c.Param("name")
		// Get the `input data` from the request body
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		res, err := e.Service.StartPipelineByName(input, accountId, name, tpAccountId)
		if err != nil {
			if err.Error() == "automation is not active" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			} else if err.Error() == "no value for this field in initial data or return values" {
				c.JSON(http.StatusBadRequest, "some of your task fields are dependent on your trigger or needed to pass in at run time if you are running an ineraction")
				return
			}
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, res)
	}
}
