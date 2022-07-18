package miniTasks

import (
	"fmt"
	"strings"
)

func ConvertToCode(steps []interface{}, importStore *ImportStore) (string, error) {

	// Convert each step to code and append to the code string using string builder
	var sb strings.Builder

	for _, step := range steps {
		code, _ := convertStepToCode(step.(map[string]interface{}), importStore)
		sb.WriteString(code + "\n")
	}

	imports, err := importStore.ToCode()

	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var sbComplete strings.Builder
	sbComplete.WriteString(imports)
	sbComplete.WriteString("\n")
	sbComplete.WriteString(sb.String())

	return sbComplete.String(), nil
}

func convertStepToCode(step map[string]interface{}, importStore *ImportStore) (string, error) {
	fmt.Printf("%#v\n", step["type"])

	switch step["type"] {
	case "assignment":
		return convertAssignment(step)
	case "function_call":
		return convertFunctionCall(step, importStore)
	case "foreach":
		return convertForeach(step, importStore)
	case "if":
		return convertIf(step, importStore)
	case "repeat":
		return convertRepeat(step, importStore)
	case "output":
		return convertOutput(step)
	default:
		return "", fmt.Errorf("Unknown step type: %s", step["type"])
	}
}
