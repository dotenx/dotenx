package crud

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) GetTemplateChildren() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		projectName := c.Param("project_name")
		accountId, _ := utils.GetAccountId(c)
		children, err := mc.Service.GetTemplateChildren(accountId, projectName, name)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		// filter pipelines by tp account id (just for 'tp' users)
		tokenType, _ := c.Get("tokenType")
		if tokenType == "tp" {
			tpAccountId, _ := utils.GetThirdPartyAccountId(c)
			filteredChildren := make([]models.Pipeline, 0)
			for _, child := range children {
				if child.CreatedFor == tpAccountId {
					filteredChildren = append(filteredChildren, child)
				}
			}
			children = filteredChildren
		}
		c.JSON(http.StatusOK, children)
	}
}
