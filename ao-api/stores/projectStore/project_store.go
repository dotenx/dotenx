package projectStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) ProjectStore {
	return &projectStore{db}
}

type ProjectStore interface {
	AddProject(ctx context.Context, accountId string, project models.Project) error
	CreateProjectDatabase(ctx context.Context, accountId string, projectName string) error
	CreateDbUserAndGrantAccess(ctx context.Context, accountId string, projectName string) error
	ListProjects(ctx context.Context, accountId string) ([]models.Project, error)
	ListDBProjects(ctx context.Context, accountId string) ([]models.Project, error)
	ListProjectExternalDomains(ctx context.Context, accountId string) ([]models.ProjectDomain, error)
	GetProject(ctx context.Context, accountId string, projectName string) (models.Project, error)
	GetProjectByTag(ctx context.Context, tag string) (models.Project, error)
	GetProjectDomain(ctx context.Context, accountId, projectTag string) (models.ProjectDomain, error)
	GetProjectDomainByCertificateArn(ctx context.Context, certificateArn string) (models.ProjectDomain, error)
	UpsertProjectDomain(ctx context.Context, projectDomain models.ProjectDomain) error

	// This function deletes the domain associated with the project
	DeleteProjectDomain(ctx context.Context, projectDomain models.ProjectDomain) error

	// This function deletes the project record from the database
	DeleteProjectByTag(ctx context.Context, projectTag string) error
}

type projectStore struct {
	db *db.DB
}
