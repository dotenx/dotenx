package project

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) AddProject(mService marketplaceService.MarketplaceService, dbService databaseService.DatabaseService, cService crudService.CrudService, uiBuilderService uibuilderService.UIbuilderService, objService objectstoreService.ObjectstoreService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto ProjectRequest
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "name of project should contain just small letters, numbers and underscores also project type should be one of 'web_application', 'landing_page', 'ecommerce', 'website', 'ai_website'",
			})
			return
		}
		if dto.Type == "" {
			dto.Type = "web_application"
		}
		switch dto.Type {
		case "web_application":
			dto.HasDatabase = true
		case "landing_page":
			dto.HasDatabase = false
		case "ecommerce":
			dto.HasDatabase = true
		case "website":
			dto.HasDatabase = false
		case "ai_website":
			dto.HasDatabase = false
			// Instantiate the custom validator
			v := validator.New()
			validatorInstance := &AIWebsiteConfigurationValidator{validator: v}
			// Use the custom validator for this API call
			if err := validatorInstance.Validate(&dto); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
		}

		var err error
		if dto.ItemId != 0 {
			err = pc.Service.ImportProject(accountId, dto.Name, dto.Description, dto.ItemId, mService, dbService, cService, uiBuilderService)
		} else {
			aiWebsiteConfiguration, _ := json.Marshal(dto.AIWebsiteConfiguration)
			err = pc.Service.AddProject(accountId, models.Project{
				Name:                   dto.Name,
				Description:            dto.Description,
				AccountId:              accountId,
				DefaultUserGroup:       dto.DefaultUserGroup, // todo: do we need to keep this? seems too early in the user flow.
				Type:                   dto.Type,
				AIWebsiteConfiguration: aiWebsiteConfiguration,
				Theme:                  dto.Theme,
				HasDatabase:            dto.HasDatabase,
			}, uiBuilderService)
		}
		if err != nil {
			log.Println(err)
			if err == utils.ErrReachLimitationOfPlan {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		project, pErr := pc.Service.GetProject(accountId, dto.Name)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}
		project.AccountId = accountId

		err = pc.Service.InitialSetup(project, objService)
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{"message": "Project created successfully"})
	}
}

type ProjectRequest struct {
	ItemId                 int                               `json:"itemId"`
	Name                   string                            `db:"name" json:"name" binding:"regexp=^[a-z][a-z0-9_]*$,min=2,max=20"`
	Description            string                            `db:"description" json:"description"`
	Tag                    string                            `db:"tag" json:"tag"`
	DefaultUserGroup       string                            `json:"default_user_group"`
	Type                   string                            `db:"type" json:"type" binding:"oneof='' 'web_application' 'landing_page' 'ecommerce' 'website' 'ai_website'"`
	AIWebsiteConfiguration models.AIWebsiteConfigurationType `db:"ai_website_configuration" json:"ai_website_configuration,omitempty" binding:"dive"`
	Theme                  string                            `db:"theme" json:"theme"`
	HasDatabase            bool                              `json:"hasDatabase"`
}

// AIWebsiteConfigurationValidator defines a custom validator
type AIWebsiteConfigurationValidator struct {
	validator *validator.Validate
}

// Validate validates the content field to ensure it contains a string and a number
func (cv *AIWebsiteConfigurationValidator) Validate(obj interface{}) error {
	if err := cv.validator.Struct(obj); err != nil {
		return err
	}

	// Custom validation for the "content" field
	configuration := reflect.ValueOf(obj).Elem().FieldByName("AIWebsiteConfiguration")
	logrus.Info(configuration)
	if configuration.IsValid() && configuration.Kind() == reflect.Struct {
		BusinessName := configuration.FieldByName("BusinessName").Interface()
		BusinessType := configuration.FieldByName("BusinessType").Interface()
		BusinessSubType := configuration.FieldByName("BusinessSubType").Interface()

		if _, ok := BusinessName.(string); !ok || BusinessName == "" {
			return fmt.Errorf("ai_website_configuration.business_name must be a non-empty string")
		}

		if _, ok := BusinessType.(string); !ok || BusinessType == "" {
			return fmt.Errorf("ai_website_configuration.business_type must be a non-empty string")
		}

		if _, ok := BusinessSubType.(string); !ok {
			return fmt.Errorf("ai_website_configuration.business_sub_type must be a string")
		}
	}

	return nil
}
