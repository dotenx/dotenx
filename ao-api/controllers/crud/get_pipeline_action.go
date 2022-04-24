package crud

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) GetPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accept := c.GetHeader("accept")
		accountId, _ := utils.GetAccountId(c)

		pipeline, endpoint, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		output := struct {
			Name            string `json:"name" yaml:"name"`
			models.Manifest `json:"manifest" yaml:"manifest"`
			Endpoint        string `json:"endpoint" yaml:"endpoint"`
		}{name, pipeline.Manifest, endpoint}
		switch accept {
		case "application/json":
			c.JSON(http.StatusOK, output)
		case "application/x-yaml":
			c.YAML(http.StatusOK, output)
		default:
			c.JSON(http.StatusOK, output)
		}
	}
}
