package internalController

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/services/internalService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type InternalController struct {
	Service internalService.InternalService
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) ActivateAutomation(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) DeActivateAutomation(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) SubmitExecution(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) UpdateExecutionTasksUsage(ctx *gin.Context) {
	ctx.Status(http.StatusOK)
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) CheckAccess(ctx *gin.Context) {
	type AccessDto struct {
		Access bool `json:"access"`
	}
	res := AccessDto{
		Access: true,
	}
	ctx.JSON(http.StatusOK, res)
}

// a dummy handler just for local use cases when running project locally address of dotenx-admin
// is actually ao-api address so we need this dummy hendler
func (c *InternalController) GetCurrentPlan(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{
		"plan":                    "pro",
		"plan_execution_minutes":  50000,
		"plan_active_automations": 30,
		"plan_databases":          10,
		"plan_domains":            10,
		"plan_trigger_frequency":  90,
		"plan_projects":           150,
		"plan_tp_users":           1500,
		"plan_file_bandwidth":     "100GB",
		"plan_has_user_group":     true,
	})
}

func (c *InternalController) ListProjects(ctx *gin.Context) {
	type body struct {
		AccountId   string `json:"accountId"`
		ProjectType string `json:"projectType"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	projects, err := c.Service.ListProjects(dto.AccountId, dto.ProjectType)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"projects": projects,
		"total":    len(projects),
	})
}

// ListDBProjects returns projects that have database
func (c *InternalController) ListDBProjects(ctx *gin.Context) {
	type body struct {
		AccountId string `json:"accountId"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	projects, err := c.Service.ListDBProjects(dto.AccountId)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"projects": projects,
		"total":    len(projects),
	})
}

func (c *InternalController) ListTpUsers(ctx *gin.Context) {
	type body struct {
		AccountId string `json:"accountId"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	// TODO: Implementing an acceptable method for getting number of tp users (for DoTenX users)
	// projects, err := c.Service.ListDBProjects(dto.AccountId)
	// if err != nil {
	// 	logrus.Error(err.Error())
	// 	ctx.JSON(http.StatusBadRequest, gin.H{
	// 		"message": err.Error(),
	// 	})
	// 	return
	// }

	// Currently we return an empty array for list of tp users (no limitation on number of tp users)
	// tpUsers, err := c.Service.ListTpUsers(projects, dto.AccountId)
	tpUsers := make([]string, 0)
	var err error
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"tp_users": tpUsers,
		"total":    len(tpUsers),
	})
}

func (c *InternalController) ListUiPages(ctx *gin.Context) {
	type body struct {
		AccountId string `json:"accountId"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	uiPages, err := c.Service.ListUiPages(dto.AccountId)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ui_pages": uiPages,
		"total":    len(uiPages),
	})
}

// ListDomains returns list of external domains for a specific user
func (c *InternalController) ListDomains(ctx *gin.Context) {
	type body struct {
		AccountId   string `json:"accountId"`
		ProjectType string `json:"projectType"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	domains, err := c.Service.ListDomains(dto.AccountId, dto.ProjectType)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"domains": domains,
		"total":   len(domains),
	})
}

func (c *InternalController) ListUiForms(ctx *gin.Context) {
	type body struct {
		AccountId   string `json:"accountId"`
		ProjectType string `json:"projectType"`
		From        string `json:"from"`
		To          string `json:"to"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	numberOfForms, err := c.Service.GetNumberOfUiFormResponse(dto.AccountId, dto.ProjectType, dto.From, dto.To)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"total": numberOfForms,
	})
}

// GetFileStorageUsage returns total file size of object store for a specific user by given project type
func (c *InternalController) GetFileStorageUsage(ctx *gin.Context) {
	type body struct {
		AccountId   string `json:"accountId"`
		ProjectType string `json:"projectType"`
	}
	var dto body
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	usage, err := c.Service.GetFileStorageUsage(dto.AccountId, dto.ProjectType)
	if err != nil {
		logrus.Error(err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"usage": usage,
	})
}
