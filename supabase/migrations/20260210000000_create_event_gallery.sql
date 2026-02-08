-- Tabela para fotos do evento (galeria "como foi")
CREATE TABLE IF NOT EXISTS event_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_path text NOT NULL,
  ordem int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_gallery_event_id ON event_gallery(event_id);
