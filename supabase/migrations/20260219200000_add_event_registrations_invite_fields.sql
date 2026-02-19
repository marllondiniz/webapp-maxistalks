-- Adiciona campos de convite em event_registrations

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS convidado_selecionado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS convite_enviado_em timestamptz;

CREATE INDEX IF NOT EXISTS idx_event_registrations_selecionado
  ON event_registrations(event_id, convidado_selecionado)
  WHERE convidado_selecionado = true;

COMMENT ON COLUMN event_registrations.convidado_selecionado IS 'Usuário foi selecionado pelo admin para receber convite neste evento.';
COMMENT ON COLUMN event_registrations.convite_enviado_em IS 'Data/hora em que o admin marcou o convite como disparado via WhatsApp.';
