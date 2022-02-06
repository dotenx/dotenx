package crud

import (
	"log"
	"net/http"
	"strconv"

	"github.com/utopiops/automated-ops/ao-api/models"
	"gopkg.in/yaml.v2"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) GetPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		versionString := c.Param("version")
		i64, err := strconv.ParseInt(versionString, 10, 16)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		version := int16(i64)
		accept := c.GetHeader("accept")
		accountId := c.MustGet("accountId").(string)

		pipeline, endpoint, err := mc.Service.GetPipelineByVersion(version, accountId, name)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		output := struct {
			models.PipelineVersion
			Endpoint string `json:"endpoint"`
		}{pipeline, endpoint}
		switch accept {
		case "application/json":
			c.JSON(http.StatusOK, output)
		case "application/x-yaml":
			bytes, err := yaml.Marshal(output)
			if err != nil {
				log.Println(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
			c.String(http.StatusOK, string(bytes))
		default:
			c.JSON(http.StatusOK, output)
		}
	}
}
