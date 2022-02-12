package runnercontroller

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	runnerservice "github.com/utopiops/automated-ops/ao-api/services/runnerService"
)

type RunnerController struct {
	service runnerservice.RunnerService
}

func New(runnerService runnerservice.RunnerService) *RunnerController {
	return &RunnerController{service: runnerService}
}

func (r *RunnerController) RegisterRunner(ctx *gin.Context) {
	accountId := ctx.MustGet("accountId").(string)
	runnerType := ctx.Param("type")
	id, err := r.service.Store(accountId, runnerType)
	if err != nil {
		log.Println(err)
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"runnerId": id,
	})
	return
}

func (r *RunnerController) GetQueueId(ctx *gin.Context) {
	runnerId := ctx.Param("id")
	queueId, err := r.service.Get(runnerId)
	if err != nil {
		log.Println(err)
		ctx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"queueId": queueId,
	})
	return
}
