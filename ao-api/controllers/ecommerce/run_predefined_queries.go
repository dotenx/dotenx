package ecommerce

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) RunPredefinedQueries() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")

		project, err := ec.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if project.Type != "ecommerce" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this project isn't an 'ecommerce' project",
			})
			return
		}

		type predefinedQuery struct {
			Goal string `json:"goal" binding:"required"`
		}
		dto := predefinedQuery{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if dto.Goal == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "goal field can't be empty",
			})
			return
		}

		var query string
		switch dto.Goal {
		case "get_total_revenue":
			query = `
			select sum(paid_amount) as total_revenue 
			from orders 
			where payment_status='succeeded';
			`

		case "get_last_24h_revenue":
			query = fmt.Sprintf(`
			select sum(paid_amount) as total_revenue 
			from orders 
			where payment_status='succeeded' and updated_at >= '%s';
			`, time.Now().AddDate(0, 0, -1).Format(time.RFC3339))

		case "get_MRR":
			query = fmt.Sprintf(`
			select sum(paid_amount) as mrr 
			from orders join products on orders.__products = products.id 
			where payment_status='succeeded' and updated_at >= '%s' and products.type = 'membership';
			`, time.Now().AddDate(0, -1, 0).Format(time.RFC3339))

		case "get_daily_sale_of_current_month":
			query = fmt.Sprintf(`
			select sum(paid_amount) as sale_amount, date(updated_at) 
			from orders 
			where updated_at >= '%s'
			group by date(updated_at);
			`, time.Now().AddDate(0, -1, 0).Format(time.RFC3339))

		case "get_daily_sale_of_membership_products_in_current_month":
			query = fmt.Sprintf(`
			select sum(paid_amount) as sale_amount, date(updated_at) 
			from orders join products on orders.__products = products.id 
			where products.type = 'membership' and orders.updated_at >= '%s' 
			group by date(orders.updated_at);
			`, time.Now().AddDate(0, -1, 0).Format(time.RFC3339))

		case "get_daily_sale_of_one_time_products_in_current_month":
			query = fmt.Sprintf(`
			select sum(paid_amount) as sale_amount, date(updated_at) 
			from orders join products on orders.__products = products.id 
			where products.type = 'one-time' and orders.updated_at >= '%s' 
			group by date(orders.updated_at);
			`, time.Now().AddDate(0, -1, 0).Format(time.RFC3339))

		case "get_total_members":
			query = `
			select count(*) as total_members 
			from (select distinct email from orders) as email_list;
			`

		case "get_daily_new_members_in_current_month":
			query = fmt.Sprintf(`
			select count(audience.email), date(audience.joined_at) 
			from (select min(updated_at) as joined_at, email from orders group by email) as audience 
			where audience.joined_at >= '%s'
			group by date(audience.joined_at);
			`, time.Now().AddDate(0, -1, 0).Format(time.RFC3339))

		case "get_number_of_new_members_in_last_24h":
			query = fmt.Sprintf(`
			select count(audience.email) as new_members 
			from (select min(updated_at) as joined_at, email from orders group by email) as audience 
			where audience.joined_at >= '%s';
			`, time.Now().AddDate(0, 0, -1).Format(time.RFC3339))

		case "get_all_audience":
			query = `
			select distinct email from orders;
			`

		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "goal field isn't valid",
			})
			return
		}

		result, err := ec.DatabaseService.RunDatabaseQuery(projectTag, query)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
