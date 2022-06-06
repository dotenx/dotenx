package crud

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) CreateFromTemplate() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		mc.Service.GetPipelineByName("accountId", name)
		var pipelineDto PipelineDto
		if err := c.ShouldBindJSON(&pipelineDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		accountId, _ := utils.GetAccountId(c)

		base := models.Pipeline{
			AccountId: accountId,
			Name:      pipelineDto.Name,
		}

		pipeline := models.PipelineVersion{
			Manifest: pipelineDto.Manifest,
		}

		err := mc.Service.CreatePipeLine(&base, &pipeline)
		if err != nil {
			log.Println(err.Error())
			if err.Error() == "invalid pipeline name or base version" || err.Error() == "pipeline already exists" {
				c.Status(http.StatusBadRequest)
				return
			}
			c.Status(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, gin.H{"name": pipelineDto.Name})
	}
}
