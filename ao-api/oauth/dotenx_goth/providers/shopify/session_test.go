package shopify_test

import (
	"testing"

	goth "github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth"
	"github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth/providers/shopify"
	"github.com/stretchr/testify/assert"
)

func Test_Implements_Session(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	s := &shopify.Session{}

	a.Implements((*goth.Session)(nil), s)
}

func Test_GetAuthURL(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	s := &shopify.Session{}

	_, err := s.GetAuthURL()
	a.Error(err)

	s.AuthURL = "/foo"

	url, _ := s.GetAuthURL()
	a.Equal(url, "/foo")
}

func Test_ToJSON(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	s := &shopify.Session{}

	data := s.Marshal()
	a.Equal(data, `{"AuthURL":"","AccessToken":"","Hostname":"","HMAC":"","ExpiresAt":"0001-01-01T00:00:00Z"}`)
}

func Test_String(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	s := &shopify.Session{}

	a.Equal(s.String(), s.Marshal())
}
