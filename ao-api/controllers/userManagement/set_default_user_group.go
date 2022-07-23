package userManagement

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type setDefaultReq struct {
	Name string `json:"name"`
}

func (umc *UserManagementController) SetDefaultUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body setDefaultReq
		projectTag := ctx.Param("tag")
		ugName := ctx.Param("name")
		if ctx.ShouldBindJSON(&body) != nil || body.Name == "" || projectTag == "" || ugName == "" {
			log.Println("body:", body)
			log.Println("projectTag:", projectTag)
			log.Println("ugName:", ugName)
			ctx.Status(http.StatusBadRequest)
			return
		}

		err := umc.Service.SetDefaultUserGroup(projectTag, body.Name)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}
		ctx.Status(http.StatusOK)
	}
}
