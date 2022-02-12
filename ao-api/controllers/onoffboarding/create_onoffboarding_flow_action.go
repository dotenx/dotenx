// Package onoffboarding contains the controller and actions to support the on/off boarding specific pipelines' functionalities.
package onoffboarding

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

// CreateOnOffBoardingFlow creates an On/Off boarding flow.
func (ob *Controller) CreateOnOffBoardingFlow(flowType models.FlowType) gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto models.PipelineDto
		if err := c.ShouldBindYAML(&pipelineDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		accountId := c.MustGet("accountId").(string)

		base := models.Pipeline{
			AccountId: accountId,
			Name:      pipelineDto.Name,
		}
		// we pass 0 as version because it is a new pipe line
		err := ob.Service.AddFlow(pipelineDto, base, flowType, 0)
		if err != nil {
			log.Println(err.Error())
			if err.Error() == "invalid pipeline name or base version" || err.Error() == "pipeline already exists" {
				c.Status(http.StatusBadRequest)
				return
			}
			c.Status(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
