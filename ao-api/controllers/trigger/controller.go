package trigger

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
	"github.com/utopiops/automated-ops/ao-api/services/crudService"
	triggerService "github.com/utopiops/automated-ops/ao-api/services/triggersService"
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
		err := controller.Service.DeleteTrigger(accountId, trigger)
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
		triggers, err := controller.Service.GetAllTriggers(accountId)
		if err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		pipeline, ok := c.GetQuery("pipeline")
		if ok {
			selected := make([]models.EventTrigger, 0)
			for _, tr := range triggers {
				if tr.Pipeline == pipeline {
					selected = append(selected, tr)
				}
			}
			c.JSON(http.StatusOK, selected)
			return
		}
		c.JSON(http.StatusOK, triggers)
	}
}

func (controller *TriggerController) AddTrigger() gin.HandlerFunc {
	return func(c *gin.Context) {
		var trigger models.EventTrigger
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&trigger); err != nil || accountId == "" {
			log.Println(err)
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, endpoint, err := controller.CrudService.GetPipelineByName(accountId, trigger.Pipeline)
		if err != nil {
			log.Println(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		trigger.Endpoint = endpoint
		err = controller.Service.AddTrigger(accountId, trigger)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, nil)
	}
}
func (controller *TriggerController) GetTriggersTypes() gin.HandlerFunc {
	return func(c *gin.Context) {
		triggers, _ := controller.Service.GetTriggerTypes()
		//fmt.Println(triggers)
		c.JSON(http.StatusOK, triggers)
	}
}
