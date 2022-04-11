package fitbit_test

import (
	"os"
	"testing"

	goth "github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth"
	"github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth/providers/fitbit"
	"github.com/stretchr/testify/assert"
)

func provider() *fitbit.Provider {
	return fitbit.New(os.Getenv("FITBIT_KEY"), os.Getenv("FITBIT_SECRET"), "/foo", "user")
}

func Test_New(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	p := provider()

	a.Equal(p.ClientKey, os.Getenv("FITBIT_KEY"))
	a.Equal(p.Secret, os.Getenv("FITBIT_SECRET"))
	a.Equal(p.CallbackURL, "/foo")
}

func Test_ImplementsProvider(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	a.Implements((*goth.Provider)(nil), provider())
}

func Test_BeginAuth(t *testing.T) {
	t.Parallel()
	a := assert.New(t)

	p := provider()
	session, err := p.BeginAuth("test_state")
	s := session.(*fitbit.Session)
	a.NoError(err)
	a.Contains(s.AuthURL, "www.fitbit.com/oauth2/authorize")
}

func Test_SessionFromJSON(t *testing.T) {
	t.Parallel()
	a := assert.New(t)

	p := provider()
	session, err := p.UnmarshalSession(`{"AuthURL":"https://www.fitbit.com/oauth2/authorize","AccessToken":"1234567890","UserID":"abc"}`)
	a.NoError(err)

	s := session.(*fitbit.Session)
	a.Equal(s.AuthURL, "https://www.fitbit.com/oauth2/authorize")
	a.Equal(s.AccessToken, "1234567890")
	a.Equal(s.UserID, "abc")
}
