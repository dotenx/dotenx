package crud

import (
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
)

type CRUDController struct {
	Service       crudService.CrudService
	TriggerServic triggerService.TriggerService
}
