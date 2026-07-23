# Cobertura por rota

| Rota | Público | Origem | Ofertas obrigatórias | CTA primário | CTA secundário | Mídia obrigatória |
|---|---|---|---|---|---|---|
| `/` | público geral | busca, direto e social | marca, loja, três coleções, experiências, horários | descobrir a loja | WhatsApp/rota pendentes + Instagram | 11 fotos + 2 vídeos + logo HQ |
| `/instagram` | público social | Instagram/QR/mensagem | marca, links concentrados, duas vitrines, horários | WhatsApp pendente | rota pendente + Instagram/home | logo + 8 fotos + 2 vídeos + loop da borboleta |

| ID | Requisito | Fonte | Rotas obrigatórias | Primeira dobra | Componente | Status | Evidência |
|---|---|---|---|---|---|---|---|
| CV-001 | Helena Joias | escopo | todas | sim | Header/Brand | aprovado | DOM das duas rotas |
| CV-002 | CTA de coleções | pedido | todas | sim | Hero/LinkHub | aprovado | preview das primeiras dobras |
| CV-003 | três séries independentes | pedido | `/` | não | ScrollGallery | aprovado | arrays isolados + DOM + scroll |
| CV-004 | dois vídeos reais | Drive | `/` | não | SmartVideo | aprovado | reprodução contextual testada |
| CV-005 | horários confirmados | escopo | todas | não | Footer/LinkHours | aprovado | teste de renderização |
| CV-006 | Instagram oficial | escopo | todas | sim | SocialCTA | aprovado | link presente nas duas rotas |
