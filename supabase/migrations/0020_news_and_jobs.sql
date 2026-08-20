-- Page "Infos & actualités" + candidatures aux postes.
-- Même conventions que products/categories : lecture publique du contenu
-- publié, écriture réservée aux admins via is_admin() (migration 0006).

create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  body_fr text not null,
  body_en text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  description_fr text not null,
  description_en text not null,
  location text,
  status text not null default 'draft' check (status in ('draft', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Candidatures : job_title_fr est un instantané (comme order_items.product_name)
-- pour rester lisible même si le poste est supprimé ensuite ; cv_path est un
-- chemin dans le bucket privé job-application-cvs, jamais une URL publique.
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete set null,
  job_title_fr text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  cv_path text not null,
  cv_original_filename text not null,
  created_at timestamptz not null default now()
);

create index news_articles_status_idx on public.news_articles (status);
create index jobs_status_idx on public.jobs (status);
create index job_applications_job_id_idx on public.job_applications (job_id);

alter table public.news_articles enable row level security;

create policy "news_articles_select_active"
  on public.news_articles for select
  using (status = 'active');

create policy "news_articles_admin_write"
  on public.news_articles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.jobs enable row level security;

create policy "jobs_select_active"
  on public.jobs for select
  using (status = 'active');

create policy "jobs_admin_write"
  on public.jobs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Candidatures : aucune policy d'insert — écriture exclusivement via le
-- client service-role (submitJobApplication), jamais directement depuis le
-- client, même précaution que orders. Lecture/suppression réservées aux
-- admins.
alter table public.job_applications enable row level security;

create policy "job_applications_admin_select"
  on public.job_applications for select
  to authenticated
  using (public.is_admin());

create policy "job_applications_admin_delete"
  on public.job_applications for delete
  to authenticated
  using (public.is_admin());

create trigger news_articles_set_updated_at
  before update on public.news_articles
  for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- Bucket images d'articles : public, écriture admin (triplet identique à
-- product-images, migration 0006).
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "article_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "article_images_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images' and public.is_admin());

create policy "article_images_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin())
  with check (bucket_id = 'article-images' and public.is_admin());

create policy "article_images_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin());

-- Bucket CV : privé, aucune policy — uniquement accédé via le client
-- service-role (upload à la candidature, URL signée générée côté serveur
-- pour le téléchargement admin après vérification is_admin() sur
-- job_applications, déjà RLS-protégée).
insert into storage.buckets (id, name, public)
values ('job-application-cvs', 'job-application-cvs', false)
on conflict (id) do nothing;
