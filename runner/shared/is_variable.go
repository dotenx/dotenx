package shared

import "regexp"

// This is treated so special to be kept in sync everywhere we want to check if a field in the task body of a pipeline task is set to a variable
// IsVariable checks if the value is a pipeline variable
func IsVariable(value string) (is bool) {
	variable := regexp.MustCompile(`^\$((secret)|(input)).*`)
	return variable.MatchString(value)
}
