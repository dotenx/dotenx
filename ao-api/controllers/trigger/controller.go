package trigger

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
	triggerService "github.com/utopiops/automated-ops/ao-api/services/triggersService"
)

type TriggerController struct {
	Service triggerService.TriggerService
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
		err := controller.Service.AddTrigger(accountId, trigger)
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
