-- PostgreSQL schema for tourism collection game MVP

create table if not exists places (
  id uuid primary key,
  source_id varchar not null unique,
  name varchar not null,
  category varchar not null,
  address varchar,
  lat double precision not null,
  lng double precision not null,
  image_url varchar,
  source_provider varchar not null default 'tourapi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_places_lat_lng on places(lat, lng);
create index if not exists idx_places_category on places(category);

create table if not exists place_cards (
  id uuid primary key,
  place_id uuid not null references places(id) on delete cascade,
  title varchar not null,
  rarity varchar not null check (rarity in ('common', 'rare', 'epic')),
  image_url varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_place_cards_place unique (place_id)
);

create table if not exists user_place_visits (
  id uuid primary key,
  user_id varchar not null,
  place_id uuid not null references places(id) on delete cascade,
  first_visited_at timestamptz not null,
  visited_lat double precision not null,
  visited_lng double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_user_place_visit unique (user_id, place_id)
);

create index if not exists idx_user_place_visits_user_id on user_place_visits(user_id);

create table if not exists user_cards (
  id uuid primary key,
  user_id varchar not null,
  card_id uuid not null references place_cards(id) on delete cascade,
  acquired_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_user_cards unique (user_id, card_id)
);

create index if not exists idx_user_cards_user_id on user_cards(user_id);
