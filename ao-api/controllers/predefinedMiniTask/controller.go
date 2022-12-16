package predefinedMiniTask

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

type PredefinedMiniTaskController struct {
}

func (prmt *PredefinedMiniTaskController) GetMiniTasks(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"mini_tasks": models.AvaliableMiniTasks,
	})
}
