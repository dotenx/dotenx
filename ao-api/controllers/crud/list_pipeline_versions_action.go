package crud

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) ListPipelineVersions() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId := c.MustGet("accountId").(string)
		versions, err := mc.Service.ListPipelineVersionsByName(accountId, name)
		if err != nil {
			if err.Error() == "Not found" {
				c.Status(http.StatusNotFound)
				return
			}
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, versions)
	}
}
