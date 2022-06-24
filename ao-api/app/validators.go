package app

import (
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func RegisterCustomValidators() {

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("regexp", regexpValidator) // Usage: regexp=<your-regexp>
	}
}

func regexpValidator(f validator.FieldLevel) bool {
	param := f.Param()
	reg := regexp.MustCompile(param)
	return reg.MatchString(f.Field().String())
}
