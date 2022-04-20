package crud

import (
	"encoding/json"
	"log"
	"net/http"

	jsoniter "github.com/json-iterator/go"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) AddPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto PipelineDto
		accept := c.GetHeader("accept")
		if accept == "application/x-yaml" {
			var result map[string]interface{}
			if err := c.ShouldBindYAML(&result); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			for key, val := range result {
				if key == "manifest" {
					var mani map[string]models.Task
					var json2 = jsoniter.ConfigCompatibleWithStandardLibrary
					bytes, err1 := json2.Marshal(&val)
					err2 := json.Unmarshal(bytes, &mani)
					if err1 != nil || err2 != nil {
						return
					}
					manifast := models.Manifest{}
					manifast.Tasks = make(map[string]models.Task)
					for name, task := range mani {
						manifast.Tasks[name] = task
					}
					pipelineDto.Manifest = manifast
				}
				if key == "name" {
					pipelineDto.Name = val.(string)
				}
			}
		} else {
			if err := c.ShouldBindJSON(&pipelineDto); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
		}
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
