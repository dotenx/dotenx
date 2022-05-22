package trigger

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/gin-gonic/gin"
)

type TriggerController struct {
	Service     triggerService.TriggerService
	CrudService crudService.CrudService
}

func (controller *TriggerController) GetAllTriggersForAccountByType() gin.HandlerFunc {
	return func(c *gin.Context) {
		typetrigger := c.Param("type")
		accountId, _ := utils.GetAccountId(c)
		triggers, err := controller.Service.GetAllTriggersForAccountByType(accountId, typetrigger)
		if err == nil {
			c.JSON(http.StatusOK, triggers)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())
	}
}
func (controller *TriggerController) GetDefinitionForTrigger() gin.HandlerFunc {
	return func(c *gin.Context) {
		typetrigger := c.Param("type")
		accountId, _ := utils.GetAccountId(c)
		intgType, err := controller.Service.GetDefinitionForTrigger(accountId, typetrigger)
		if err == nil {
			c.JSON(http.StatusOK, intgType)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}
func (controller *TriggerController) DeleteTrigger() gin.HandlerFunc {
	return func(c *gin.Context) {
		trigger := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		pipeline := c.Query("pipeline")
		if pipeline == "" || trigger == "" {
			c.JSON(http.StatusBadRequest, nil)
			return
		}
		err := controller.Service.DeleteTrigger(accountId, trigger, pipeline)
		if err == nil {
			c.JSON(http.StatusOK, nil)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *TriggerController) GetAllTriggers() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		pipeline, ok := c.GetQuery("pipeline")
		var err error
		var triggers []models.EventTrigger
		if !ok {
			triggers, err = controller.Service.GetAllTriggersForAccount(accountId)
		} else {
			triggers, err = controller.Service.GetAllTriggersForPipeline(accountId, pipeline)
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		c.JSON(http.StatusOK, triggers)
	}
}

func (controller *TriggerController) AddTriggers() gin.HandlerFunc {
	return func(c *gin.Context) {
		var triggers []*models.EventTrigger
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&triggers); err != nil || accountId == "" || len(triggers) <= 0 {
			log.Println(err)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, endpoint, _, err := controller.CrudService.GetPipelineByName(accountId, triggers[0].Pipeline)
		if err != nil {
			log.Println(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		err = controller.Service.AddTriggers(accountId, triggers, endpoint)
		if err != nil {
			if err.Error() == "invalid trigger dto" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			}
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}

func (controller *TriggerController) UpdateTriggers() gin.HandlerFunc {
	return func(c *gin.Context) {
		var triggers []*models.EventTrigger
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&triggers); err != nil || accountId == "" || len(triggers) <= 0 {
			log.Println(err)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, endpoint, _, err := controller.CrudService.GetPipelineByName(accountId, triggers[0].Pipeline)
		if err != nil {
			log.Println(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		err = controller.Service.UpdateTriggers(accountId, triggers, endpoint)
		if err != nil {
			if err.Error() == "invalid trigger dto" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			}
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}

func (controller *TriggerController) GetTriggersTypes() gin.HandlerFunc {
	return func(c *gin.Context) {
		triggers, _ := controller.Service.GetTriggerTypes()
		c.JSON(http.StatusOK, gin.H{
			"triggers": triggers,
		})
	}
}
