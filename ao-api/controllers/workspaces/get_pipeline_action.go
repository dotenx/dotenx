package workspaces

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (mc *WorkspacesController) GetFlow() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		versionString := c.Param("version")
		i64, err := strconv.ParseInt(versionString, 10, 16)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		version := int16(i64)

		accountId := c.MustGet("accountId").(string)

		output, statusCode := mc.Servicee.GetFlowByVersion(version, accountId, name)
		if statusCode != http.StatusOK {
			c.Status(statusCode)
			return
		}
		c.YAML(statusCode, output)
	}
}
