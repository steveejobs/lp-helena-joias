update public.stores
set
  whatsapp_number = '5563992233535',
  whatsapp_default_message = 'Olá! Vim pelo site da Helena Joias e gostaria de solicitar atendimento.',
  updated_at = now()
where id = '11111111-1111-4111-8111-111111111111'
  and slug = 'helena-joias';
