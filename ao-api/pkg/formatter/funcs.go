package formatter

import (
	"errors"
	"fmt"
	"strings"
)

const (
	String = "string"
	Int    = "int"
	Bool   = "bool"
	Array  = "array"
)

type FormatFunc struct {
	Inputs      []string `json:"inputs"`
	Output      string   `json:"output"`
	Description string   `json:"description"`
	function    func(args ...interface{}) (string, error)
}

var ErrInvalidInput = errors.New("invalid input error")

var formatFuncs = map[string]FormatFunc{
	"ToUpper": {
		Inputs:      []string{String},
		Output:      String,
		Description: "returns input with all Unicode letters mapped to their upper case.",
		function:    ToUpper,
	},
	"String": {
		Inputs:      []string{String},
		Output:      String,
		Description: "converts input to string",
		function:    ToString,
	},
}

func ToString(args ...interface{}) (string, error) {
	if len(args) != 1 {
		return "", ErrInvalidInput
	}
	return fmt.Sprintf("%v", args[0]), nil
}

func ToUpper(args ...interface{}) (string, error) {
	var str string
	if len(args) != 1 {
		return "", ErrInvalidInput
	}
	// TODO handle panic scenario and array of interface type
	str = args[0].(string)
	return strings.ToUpper(str), nil
}

func GetFuncs() map[string]FormatFunc {
	return formatFuncs
}
