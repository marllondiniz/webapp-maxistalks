-- Adiciona coluna slug para URLs amigáveis em artigos e eventos

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS articles_tenant_id_slug_key
  ON public.articles (tenant_id, slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS events_tenant_id_slug_key
  ON public.events (tenant_id, slug)
  WHERE slug IS NOT NULL;

