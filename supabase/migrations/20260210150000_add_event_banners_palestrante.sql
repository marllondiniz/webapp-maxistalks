-- Instagram e descrição do palestrante no banner do evento
ALTER TABLE event_banners
  ADD COLUMN IF NOT EXISTS palestrante_instagram text,
  ADD COLUMN IF NOT EXISTS palestrante_descricao text;
