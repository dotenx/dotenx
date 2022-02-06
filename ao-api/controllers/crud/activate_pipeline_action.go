package crud

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) ActivatePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		versionString := c.Param("version")
		version, err := strconv.ParseInt(versionString, 10, 16)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		accountId := c.MustGet("accountId").(string)
		err = mc.Service.ActivatePipeline(accountId, name, int16(version))
		if err != nil {
			if err.Error() == "invalid pipeline name or base version" {
				c.Status(http.StatusBadRequest)
				return
			}
			c.Status(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
