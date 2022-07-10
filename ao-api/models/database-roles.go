package models

var DbRoles = map[string][]string{
	"writer": {"select", "update", "delete"},
	"editor": {"select", "update"},
	"reader": {"select"},
}
