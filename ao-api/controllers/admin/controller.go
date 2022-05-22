package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
}

func (c *AdminController) ActivateAutomation(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

func (c *AdminController) DeActivateAutomation(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

func (c *AdminController) SubmitExecution(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

func (c *AdminController) CheckAccess(ctx *gin.Context) {
	type AccessDto struct {
		Access bool `json:"access"`
	}
	res := AccessDto{
		Access: true,
	}
	ctx.JSON(http.StatusOK, res)
}
