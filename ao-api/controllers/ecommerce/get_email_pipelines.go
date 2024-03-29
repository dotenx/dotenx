package ecommerce

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) GetEmailPipelines() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
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

		pipelines, err := ec.PipelineService.ListProjectPipelines(accountId, project.Name)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		emailPipelines := make([]map[string]interface{}, 0)
		for _, p := range pipelines {
			if p.ProjectName == project.Name {
				if utils.ContainsString(DefaultPipelineNames, p.Name) {
					continue
				}
				pipeline, err := ec.PipelineService.GetPipelineByName(accountId, p.Name, project.Name)
				if err != nil {
					logrus.Error(err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{
						"message": err.Error(),
					})
					return
				}
				metadata := pipeline.PipelineDetailes.Manifest.Triggers["scheduler"].Credentials["ecommerce_metadata"].(map[string]interface{})
				emailPipelines = append(emailPipelines, map[string]interface{}{
					"name":      p.Name,
					"is_active": p.IsActive,
					"endpoint":  p.Endpoint,
					"metadata":  metadata,
				})
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"pipelines": emailPipelines,
		})
	}
}
