package ecommerce

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) GetEmailPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
		pipelineName := c.Param("pipeline_name")
		accountId, _ := utils.GetAccountId(c)

		project, err := ec.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if project.Type != "ecommerce" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this project isn't an 'ecommerce' project",
			})
			return
		}

		if utils.ContainsString(DefaultPipelineNames, pipelineName) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this pipeline isn't an email scheduling pipeline",
			})
			return
		}

		pipeline, err := ec.PipelineService.GetPipelineByName(accountId, pipelineName, project.Name)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		metadata := pipeline.PipelineDetailes.Manifest.Triggers["scheduler"].Credentials["ecommerce_metadata"].(map[string]interface{})
		emailPipeline := map[string]interface{}{
			"name":      pipelineName,
			"is_active": pipeline.IsActive,
			"endpoint":  pipeline.Endpoint,
			"metadata":  metadata,
		}

		c.JSON(http.StatusOK, emailPipeline)
	}
}
