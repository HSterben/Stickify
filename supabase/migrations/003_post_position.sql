-- Run in Supabase SQL Editor if posts.position does not exist yet.
alter table posts add column if not exists position integer;

with ranked as (
  select
    id,
    row_number() over (
      partition by category_id
      order by is_pinned desc, created_at desc
    ) - 1 as pos
  from posts
)
update posts
set position = ranked.pos
from ranked
where posts.id = ranked.id
  and posts.position is null;

create index if not exists posts_category_position_idx
  on posts (category_id, position);
