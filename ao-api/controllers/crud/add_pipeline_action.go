package crud

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (mc *CRUDController) AddPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto PipelineDto

		if err := c.ShouldBindJSON(&pipelineDto); err != nil {
			fmt.Println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22")
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(pipelineDto)
		accountId := c.MustGet("accountId").(string)
		// TODO: Add validation and check if the from version exists!

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
			fmt.Println("#######################################################################3")
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
