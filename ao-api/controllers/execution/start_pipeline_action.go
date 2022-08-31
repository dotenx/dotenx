package execution

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// This endpoint starts the pipeline ONLY IF IT'S PUBLIC
func (e *ExecutionController) StartPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		endpoint := c.Param("endpoint")
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		res, err := e.Service.StartPipelineByEndpoint(input, endpoint)
		if err != nil {
			if err == utils.ErrReachLimitationOfPlan {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			if err.Error() == "automation is not active" || err.Error() == "pipeline is not public" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			}
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, res)
	}
}
