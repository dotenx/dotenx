package models

import (
	"bytes"
	"encoding/json"
)

// Trigger Type
type TriggerType int

const (
	Manual TriggerType = iota
	Scheduled
	OnBoarding
	OffBoarding
)

var triggerTypeToString = map[TriggerType]string{
	Manual:      "Manual",
	Scheduled:   "Scheduled",
	OnBoarding:  "OnBoarding",
	OffBoarding: "OffBoarding",
}

var triggerTypeToId = map[string]TriggerType{
	"Manual":      Manual,
	"Scheduled":   Scheduled,
	"OnBoarding":  OnBoarding,
	"OffBoarding": OffBoarding,
}

func (t TriggerType) String() string {
	return triggerTypeToString[t]
}

func (t *TriggerType) Scan(value interface{}) error {
	strValue := value.(string)
	*t = triggerTypeToId[strValue]
	return nil
}

func TriggerTypeValues() []string {
	values := make([]string, len(triggerTypeToId))
	i := 0
	for key := range triggerTypeToId {
		values[i] = key
		i++
	}
	return values
}

func (t TriggerType) MarshalYAML() (interface{}, error) {
	return t.String(), nil
}

func (t *TriggerType) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var j string
	if err := unmarshal(&j); err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value, 'Manual' in this case.
	*t = triggerTypeToId[j]
	return nil
}

func (t TriggerType) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(t.String())
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

func (t *TriggerType) UnmarshalJSON(b []byte) error {
	var j string
	if err := json.Unmarshal(b, &j); err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value, 'Manual' in this case.
	*t = triggerTypeToId[j]
	return nil
}
