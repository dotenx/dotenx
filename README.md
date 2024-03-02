<p align="center">
  DoTenX core, is a full stack low-code solution for building scalable and powerful applications, automations, APIs, internal tools and much more.
</p>

---

Our mission is to make technology more accessible to small and medium size businesses.

![Twitter Follow](https://img.shields.io/twitter/follow/Do10X?style=social) ![GitHub tag (latest SemVer pre-release)](https://img.shields.io/github/v/tag/dotenx/dotenx?include_prereleases) ![GitHub release (release name instead of tag name)](https://img.shields.io/github/v/release/dotenx/dotenx?include_prereleases) ![GitHub contributors](https://img.shields.io/github/contributors/dotenx/dotenx)

Try DoTenX on cloud (no credit cards needed - unlimited access):

https://dotenx.com

Docs:

https://docs.dotenx.com (https://github.com/dotenx/dotenx-docs)



https://github.com/dotenx/dotenx/assets/15846333/98432c14-4803-4e1d-b927-8039765ecc7d




https://user-images.githubusercontent.com/15846333/212295446-4657130b-6416-4cbb-9353-14a096e3a762.mp4



YouTube:

https://www.youtube.com/channel/UC4S1w3Go3IdQpEma1i4fw4g


---


## Run locally

**Note:**
We are presently working on enabling you to run the project locally, but it is not yet complete. As a result, you will be unable to utilize all the features of the platform that are currently running in the cloud.

Step 1: Clone project -> ```git clone https://github.com/dotenx/dotenx```

Step 2: Go to dotenx root directory -> ```cd dotenx```

Step 3: Create docker network -> ```docker network create -d bridge --attachable dev```

Step 4: Run all services -> ```docker-compose up```

Step 5: Install postgresql on your device (linux-windows-macOS)

linux: https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql-linux

windows: https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql

macOS: https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql-macos

Step 6: Run this command -> ```psql -h localhost -d postgres -U psql_user -p 5434```

Note: password is "psql_password"

Step 7: Run this query ->
```
SELECT 'CREATE DATABASE ao'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ao')\gexec
```

Step 8: Run this query -> ```CREATE DATABASE template_base WITH IS_TEMPLATE TRUE;```

Step 9: Run this command -> ```\c template_base```

Step 10: Run these queries (just copy and paste and then press enter) ->
```
CREATE DOMAIN yes_no          AS BOOLEAN;
CREATE DOMAIN image_address   AS VARCHAR;
CREATE DOMAIN file_address    AS VARCHAR;
CREATE DOMAIN rating          AS int;
CREATE DOMAIN url             AS VARCHAR;
CREATE DOMAIN email           AS VARCHAR;
CREATE DOMAIN just_time       AS TIME;
CREATE DOMAIN just_date       AS DATE;
CREATE DOMAIN date_time       AS TIMESTAMP;
CREATE DOMAIN num             AS int;
CREATE DOMAIN short_text      AS VARCHAR;
CREATE DOMAIN long_text       AS TEXT;
CREATE DOMAIN link_field      AS int;
CREATE DOMAIN text_array      AS TEXT[];
CREATE DOMAIN yes_no_array    AS BOOLEAN[];
CREATE DOMAIN num_array       AS int[];
CREATE DOMAIN dtx_json        AS JSONB;
CREATE DOMAIN float_num       AS DOUBLE PRECISION;
CREATE DOMAIN float_num_array AS DOUBLE PRECISION[];
```

Step 11: Finally quit from psql with this command -> ```\q```

Developer guides:

WIP - will be added as a high priority.
