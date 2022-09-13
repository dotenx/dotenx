package pipelineStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
)

func (ps *pipelineStore) GetPipelines(context context.Context, accountId string) ([]models.Pipeline, error) {
	res := make([]models.Pipeline, 0)
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		stmt := get_all_pipelines
		rows, err := conn.Queryx(stmt, accountId)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur struct {
				Id            int            `db:"id"`
				Name          string         `db:"name"`
				Endpoint      string         `db:"endpoint"`
				AccountId     string         `db:"account_id"`
				IsActive      bool           `db:"is_active"`
				IsTemplate    bool           `db:"is_template"`
				IsInteraction bool           `db:"is_interaction"`
				IsPublic      bool           `db:"is_public"`
				UserGroups    pq.StringArray `db:"user_groups"`
				ProjectName   string         `db:"project_name"`
				ParentId      int            `db:"parent_id"`
				CreatedFor    string         `db:"created_for"`
			}
			err = rows.Scan(&cur.Id, &cur.Name, &cur.AccountId, &cur.Endpoint, &cur.IsActive, &cur.IsTemplate, &cur.IsInteraction, &cur.IsPublic, &cur.UserGroups, &cur.ProjectName, &cur.ParentId, &cur.CreatedFor)
			if err != nil {
				return nil, err
			}
			fmt.Println("##############################################")
			fmt.Println(cur)
			fmt.Println("##############################################")
			res = append(res, models.Pipeline{
				Id:            cur.Id,
				Name:          cur.Name,
				Endpoint:      cur.Endpoint,
				AccountId:     cur.AccountId,
				IsActive:      cur.IsActive,
				IsTemplate:    cur.IsTemplate,
				IsInteraction: cur.IsInteraction,
				IsPublic:      cur.IsPublic,
				UserGroups:    ([]string)(cur.UserGroups),
				ProjectName:   cur.ProjectName,
				ParentId:      cur.ParentId,
				CreatedFor:    cur.CreatedFor,
			})
		}
	}
	return res, nil

}

const get_all_pipelines = `
SELECT id, name, account_id, endpoint, is_active, is_template, is_interaction, is_public, user_groups, project_name, parent_id, created_for
FROM pipelines
WHERE account_id = $1
`
