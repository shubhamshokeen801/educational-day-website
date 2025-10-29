# Database Schema

## users
| Column       | Type         | Constraints               | Description               |
| ------------ | ------------ | ------------------------- | ------------------------- |
| `id`         | UUID / INT   | PK                        | Unique user ID            |
| `name`       | VARCHAR(100) | NOT NULL                  | Full name of the user     |
| `email`      | VARCHAR(255) | UNIQUE, NOT NULL          | User’s email address      |
| `created_at` | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | When the user was created |

## events
| Column          | Type         | Constraints               | Description                    |
| --------------- | ------------ | ------------------------- | ------------------------------ |
| `id`            | UUID / INT   | PK                        | Unique event ID                |
| `name`          | VARCHAR(150) | NOT NULL                  | Event name                     |
| `description`   | TEXT         |                           | Event details or rules         |
| `is_team_event` | BOOLEAN      | DEFAULT FALSE             | If `TRUE`, event is team-based |
| `max_team_size` | INT          | NULLABLE                  | Maximum number of team members |
| `min_team_size` | INT          | NULLABLE                  | Minimum number of team members |
| `start_date`    | TIMESTAMP    | NOT NULL                  | Event start date/time          |
| `end_date`      | TIMESTAMP    | NOT NULL                  | Event end date/time            |
| `created_at`    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Record creation time           |

## teams
| Column       | Type         | Constraints                | Description                            |
| ------------ | ------------ | -------------------------- | -------------------------------------- |
| `id`         | UUID / INT   | PK                         | Unique team ID                         |
| `event_id`   | UUID / INT   | FK → `events.id`, NOT NULL | Event associated with the team         |
| `team_name`  | VARCHAR(100) | NOT NULL                   | Chosen team name                       |
| `team_code`  | VARCHAR(10)  | UNIQUE, NOT NULL           | Code to join the team (e.g., `ABC123`) |
| `created_by` | UUID / INT   | FK → `users.id`, NOT NULL  | User who created the team              |
| `created_at` | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP  | Team creation timestamp                |

## team_members
| Column      | Type                     | Constraints               | Description                   |
| ----------- | ------------------------ | ------------------------- | ----------------------------- |
| `id`        | UUID / INT               | PK                        | Unique membership ID          |
| `team_id`   | UUID / INT               | FK → `teams.id`, NOT NULL | Team reference                |
| `user_id`   | UUID / INT               | FK → `users.id`, NOT NULL | Member reference              |
| `role`      | ENUM('leader', 'member') | DEFAULT 'member'          | Role of the member            |
| `joined_at` | TIMESTAMP                | DEFAULT CURRENT_TIMESTAMP | When the user joined the team |

## registration
| Column          | Type       | Constraints                | Description                 |
| --------------- | ---------- | -------------------------- | --------------------------- |
| `id`            | UUID / INT | PK                         | Unique registration ID      |
| `event_id`      | UUID / INT | FK → `events.id`, NOT NULL | Event reference             |
| `user_id`       | UUID / INT | FK → `users.id`, NULLABLE  | Used for solo registrations |
| `team_id`       | UUID / INT | FK → `teams.id`, NULLABLE  | Used for team registrations |
| `registered_at` | TIMESTAMP  | DEFAULT CURRENT_TIMESTAMP  | Registration timestamp      |

