package crud

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) DeletePipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId := c.MustGet("accountId").(string)
		err := mc.Service.DeletePipeline(accountId, name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, nil)

	}
}
