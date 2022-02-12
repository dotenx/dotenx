// Package onoffboarding contains the controller and actions to support the on/off boarding specific pipelines' functionalities.
package onoffboarding

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

// AddOnOffBoardingFlow adds an on/off boarding flow to an existing on/off boarding flow.
func (ob *Controller) AddOnOffBoardingFlow(flowType models.FlowType) gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto models.PipelineDto
		if err := c.ShouldBindYAML(&pipelineDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		accountId := c.MustGet("accountId").(string)

		version, err := strconv.Atoi(c.Param("version"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		name := c.Param("name")

		base := models.Pipeline{
			AccountId: accountId,
			Name:      name,
		}
		// AddFlow actually adds a pipeline version if `fromVersion` is non-zero
		err = ob.Service.AddFlow(pipelineDto, base, flowType, version)
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
