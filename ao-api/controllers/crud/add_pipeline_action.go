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
		pipelineDto, err := parsPipelineDto(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		accountId, _ := utils.GetAccountId(c)

		base := models.Pipeline{
			AccountId:     accountId,
			Name:          pipelineDto.Name,
			IsInteraction: pipelineDto.IsInteraction,
			IsTemplate:    pipelineDto.IsTemplate,
		}

		pipeline := models.PipelineVersion{
			Manifest: pipelineDto.Manifest,
		}

		// If the project name is not provided we assume this is an automation
		projectName := c.Param("project_name")
		if projectName == "" {
			projectName = "AUTOMATION_STUDIO"
		}

		err = mc.Service.CreatePipeLine(&base, &pipeline, pipelineDto.IsTemplate, pipelineDto.IsInteraction, projectName)
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

type PipelineDto struct {
	Name          string          `json:"name"`
	IsTemplate    bool            `json:"is_template"`
	IsInteraction bool            `json:"is_interaction"`
	ProjectName   string          `json:"project_name"`
	Manifest      models.Manifest `json:"manifest"`
}

func (mc *CRUDController) UpdatePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		var pipelineDto PipelineDto
		if err := c.ShouldBindJSON(&pipelineDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		//fmt.Println("################")
		//fmt.Println(pipelineDto)
		//fmt.Println("##################")
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

func parsPipelineDto(c *gin.Context) (pipelineDto PipelineDto, err error) {
	accept := c.GetHeader("accept")
	if accept == "application/x-yaml" {
		var result map[string]interface{}
		if err = c.ShouldBindYAML(&result); err != nil {
			return
		}
		for key, val := range result {
			if key == "manifest" {
				var mani models.Manifest
				var json2 = jsoniter.ConfigCompatibleWithStandardLibrary
				bytes, err1 := json2.Marshal(&val)
				err2 := json.Unmarshal(bytes, &mani)
				if err1 != nil {
					return
				} else if err2 != nil {
					return
				}
				pipelineDto.Manifest = mani
			}
			if key == "name" {
				pipelineDto.Name = val.(string)
			}
			if key == "is_interaction" {
				pipelineDto.IsInteraction = val.(bool)
			}
			if key == "is_template" {
				pipelineDto.IsTemplate = val.(bool)
			}
		}
	} else {
		if err = c.ShouldBindJSON(&pipelineDto); err != nil {
			return
		}
	}
	return
}
