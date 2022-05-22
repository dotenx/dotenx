package execution

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) StartPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)

		// accountId, _ := utils.GetAccountId(c)

		endpoint := c.Param("endpoint")
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		if input["accountId"] == nil {
			c.JSON(http.StatusBadRequest, "accountId has not been set")
			return
		}
		fmt.Println("##################execution received initial data: ")
		log.Println(input)
		id, err := e.Service.StartPipeline(input, input["accountId"].(string), endpoint)
		if err != nil {
			if err.Error() == "automation is not active" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			}
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}
