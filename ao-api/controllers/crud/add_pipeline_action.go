package crud

import (
	"encoding/json"
	"fmt"
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
					var mani models.Manifest
					var json2 = jsoniter.ConfigCompatibleWithStandardLibrary
					bytes, err1 := json2.Marshal(&val)
					err2 := json.Unmarshal(bytes, &mani)
					if err1 != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": err1.Error()})
						return
					} else if err2 != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": err2.Error()})
						return
					}
					pipelineDto.Manifest = mani
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
		c.Status(http.StatusOK)
	}
}

type PipelineDto struct {
	Name     string
	Manifest models.Manifest
}

func (mc *CRUDController) UpdatePipeline() gin.HandlerFunc {
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
			Manifest: pipelineDto.Manifest,
		}

		err := mc.Service.UpdatePipeline(&base, &pipeline)
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
