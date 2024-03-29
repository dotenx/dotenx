package crud

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) ActivatePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)
		pipeline, err := mc.Service.GetPipelineByName(accountId, name, projectName)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		if pipeline.IsTemplate {
			c.JSON(http.StatusBadRequest, gin.H{"error": "you cant activate a template"})
			return
		}
		err = mc.Service.ActivatePipeline(accountId, pipeline.PipelineDetailes.Id)
		if err != nil {
			log.Println(err.Error())
			if err == utils.ErrReachLimitationOfPlan {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
			}
			return
		}
	}
}

func (mc *CRUDController) DeActivatePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)
		pipeline, err := mc.Service.GetPipelineByName(accountId, name, projectName)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		if pipeline.IsTemplate {
			c.JSON(http.StatusBadRequest, gin.H{"error": "you cant deactivate a template"})
			return
		}
		err = mc.Service.DeActivatePipeline(accountId, pipeline.PipelineDetailes.Id, false)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
	}
}
