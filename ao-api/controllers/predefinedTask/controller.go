package predefinedTask

import (
	"log"
	"net/http"

	predifinedService "github.com/dotenx/dotenx/ao-api/services/predefinedTaskService"
	"github.com/gin-gonic/gin"
)

type PredefinedTaskController struct {
	service predifinedService.PredifinedTaskService
}

func New(service predifinedService.PredifinedTaskService) *PredefinedTaskController {
	return &PredefinedTaskController{service: service}
}

func (r *PredefinedTaskController) GetTasks(ctx *gin.Context) {
	tasks, err := r.service.GetTasks()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"tasks": tasks,
	})
}

func (r *PredefinedTaskController) GetFields(ctx *gin.Context) {
	taskName := ctx.Param("task_name")
	fields, integrationTypes, outputs, err := r.service.GetTaskFields(taskName)
	if err != nil {
		log.Println(err)
		ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"fields":            fields,
		"integration_types": integrationTypes,
		"outputs":           outputs,
	})
}
