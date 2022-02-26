package trigger

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
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
		accountId := c.MustGet("accountId").(string)
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
		accountId := c.MustGet("accountId").(string)
		intgType, err := controller.Service.GetDefinitionForTrigger(accountId, typetrigger)
		if err == nil {
			c.JSON(http.StatusOK, intgType)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *TriggerController) GetAllTriggers() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId := c.MustGet("accountId").(string)
		triggers, err := controller.Service.GetAllTriggers(accountId)
		if err == nil {
			c.JSON(http.StatusOK, triggers)
			return
		}
		c.JSON(http.StatusBadRequest, err.Error())

	}
}

func (controller *TriggerController) AddTrigger() gin.HandlerFunc {
	return func(c *gin.Context) {
		var trigger models.EventTrigger
		accountId := c.MustGet("accountId").(string)
		if err := c.ShouldBindJSON(&trigger); err != nil || accountId == "" {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		_, endpoint, err := controller.CrudService.GetPipelineByVersion(1, accountId, trigger.Pipeline)
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
