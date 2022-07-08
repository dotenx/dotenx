package crud

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/config"
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
		var tpAccountId string
		if tp, ok := c.Get("tokenType"); ok && tp == "tp" {
			accId, _ := c.Get("tpAccountId")
			tpAccountId = fmt.Sprintf("%v", accId)
		} else if config.Configs.App.RunLocally {
			tpAccountId = "123456"
		}
		if tpAccountId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "creating from template requeirs third party account id"})
			return
		}
		p, err := mc.Service.GetPipelineByName(accountId, name)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if !p.IsTemplate {
			c.JSON(http.StatusBadRequest, gin.H{"error": "you just can create automation from a template"})
			return
		}
		var fields map[string]interface{}
		if err := c.ShouldBindJSON(&fields); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		base := models.Pipeline{
			AccountId: accountId,
			Name:      name,
		}

		pipeline := models.PipelineVersion{
			Manifest: p.PipelineDetailes.Manifest,
		}

		automationName, err := mc.Service.CreateFromTemplate(&base, &pipeline, fields, tpAccountId)
		if err != nil {
			log.Println(err.Error())
			if err.Error() == "invalid pipeline name or base version" || err.Error() == "pipeline already exists" || strings.Contains(err.Error(), "your inputed integration") {
				fmt.Println("6666666666666666666666666666666666666666666666666666")
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
