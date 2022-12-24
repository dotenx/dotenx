package utils

import (
	"math/rand"
	"time"
)

var FullRunes = []rune("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
var LowercaseRunes = []rune("0123456789abcdefghijklmnopqrstuvwxyz")

func RandStringRunes(n int, letterRunes []rune) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}
