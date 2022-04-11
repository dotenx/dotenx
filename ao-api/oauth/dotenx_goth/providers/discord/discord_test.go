package discord

import (
	"os"
	"testing"

	goth "github.com/dotenx/dotenx/ao-api/oauth/dotenx_goth"
	"github.com/stretchr/testify/assert"
)

func provider() *Provider {
	return New(os.Getenv("DISCORD_KEY"),
		os.Getenv("DISCORD_SECRET"), "/foo", "user")
}

func Test_New(t *testing.T) {
	t.Parallel()
	a := assert.New(t)
	p := provider()

	a.Equal(p.ClientKey, os.Getenv("DISCORD_KEY"))
	a.Equal(p.Secret, os.Getenv("DISCORD_SECRET"))
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
	s := session.(*Session)
	a.NoError(err)
	a.Contains(s.AuthURL, "discord.com/api/oauth2/authorize")
}

func Test_SessionFromJSON(t *testing.T) {
	t.Parallel()
	a := assert.New(t)

	p := provider()
	session, err := p.UnmarshalSession(`{"AuthURL":"https://discord.com/api/oauth2/authorize", "AccessToken":"1234567890"}`)
	a.NoError(err)

	s := session.(*Session)
	a.Equal(s.AuthURL, "https://discord.com/api/oauth2/authorize")
	a.Equal(s.AccessToken, "1234567890")
}
