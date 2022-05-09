package utils

import "regexp"

func IsValid(value string, validation string) (matched bool, err error) {
	matched, err = regexp.MatchString(validation, value)
	return
}
