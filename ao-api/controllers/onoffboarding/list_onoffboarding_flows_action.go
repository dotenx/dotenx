package onoffboarding

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

// ListOnOffBoardingFlows retrieves a summarized list of the on/off boarding flows
func (ob *Controller) ListOnOffBoardingFlows(flowType models.FlowType) gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId := c.MustGet("accountId").(string)

		result, err := ob.Service.GetList(accountId, flowType)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, result)
	}
}
