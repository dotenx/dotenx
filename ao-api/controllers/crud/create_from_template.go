package crud

import (
	"log"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) CreateFromTemplate() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, err := utils.GetAccountId(c)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		p, _, _, isTemplate, _, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if !isTemplate {
			c.JSON(http.StatusBadRequest, gin.H{"error": "you just can create automation from a template"})
			return
		}
		var fields map[string]interface{}
		if err := c.ShouldBindJSON(&fields); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		base := models.Pipeline{
			AccountId: accountId,
			Name:      name,
		}

		pipeline := models.PipelineVersion{
			Manifest: p.Manifest,
		}

		automationName, err := mc.Service.CreateFromTemplate(&base, &pipeline, fields)
		if err != nil {
			log.Println(err.Error())
			if err.Error() == "invalid pipeline name or base version" || err.Error() == "pipeline already exists" || strings.Contains(err.Error(), "your inputed integration") {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.Status(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"name": automationName})
	}
}

func (mc *CRUDController) GetTemplateDetailes() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, err := utils.GetAccountId(c)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		temp, err := mc.Service.GetTemplateDetailes(accountId, name)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, temp)
	}
}

func (mc *CRUDController) GetInteractionDetailes() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, err := utils.GetAccountId(c)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		temp, err := mc.Service.GetInteractionDetailes(accountId, name)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, temp)
	}
}
