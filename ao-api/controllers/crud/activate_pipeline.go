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
		accountId, _ := utils.GetAccountId(c)
		pipeline, _, _, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		err = mc.Service.ActivatePipeline(accountId, pipeline.Id)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

	}
}

func (mc *CRUDController) DeActivatePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		pipeline, _, _, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		err = mc.Service.DeActivatePipeline(accountId, pipeline.Id, false)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

	}
}
