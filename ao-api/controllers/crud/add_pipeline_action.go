package crud

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) AddPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto PipelineDto
		if err := c.ShouldBindJSON(&pipelineDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("################")
		fmt.Println(pipelineDto)
		fmt.Println("##################")
		accountId, _ := utils.GetAccountId(c)

		base := models.Pipeline{
			AccountId: accountId,
			Name:      pipelineDto.Name,
		}

		pipeline := models.PipelineVersion{
			Manifest:    pipelineDto.Manifest,
			FromVersion: pipelineDto.FromVersion,
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
		c.Status(http.StatusOK)
	}
}

type PipelineDto struct {
	Name        string
	Manifest    models.Manifest
	FromVersion int16 `json:"fromVersion"`
}
