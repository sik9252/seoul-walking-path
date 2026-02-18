-- PostgreSQL schema draft for checkpoint-based completion

create table if not exists course_checkpoints (
  id uuid primary key,
  course_id varchar not null,
  checkpoint_order int not null,
  raw_name varchar not null,
  canonical_name varchar not null,
  lat double precision,
  lng double precision,
  confidence_score double precision not null default 0,
  needs_review boolean not null default true,
  source varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_course_checkpoints_course_order unique (course_id, checkpoint_order)
);

create index if not exists idx_course_checkpoints_course_order
  on course_checkpoints(course_id, checkpoint_order);

create table if not exists course_attempts (
  id uuid primary key,
  user_id varchar not null,
  course_id varchar not null,
  status varchar not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  total_checkpoints int not null,
  visited_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_attempts_user_course
  on course_attempts(user_id, course_id);

create index if not exists idx_course_attempts_user_status
  on course_attempts(user_id, status);

create table if not exists attempt_checkpoint_visits (
  id uuid primary key,
  attempt_id uuid not null,
  checkpoint_id uuid not null,
  visited_at timestamptz not null,
  distance_m double precision not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  constraint uniq_attempt_checkpoint unique (attempt_id, checkpoint_id)
);

create index if not exists idx_attempt_visits_attempt
  on attempt_checkpoint_visits(attempt_id);
