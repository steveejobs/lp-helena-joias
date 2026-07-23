# Registro de requisitos

| ID | Requisito | Rota | Dispositivo | Prioridade | Intenção | Status | Evidência |
|---|---|---|---|---|---|---|---|
| RQ-001 | Paleta extraída da logo com fundo | todas | todos | P0 | visual | aprovado | tokens e preview |
| RQ-002 | Experiência autoral, sem aparência genérica | `/` | todos | P0 | visual | aprovado | inspeção visual do hero e seções |
| RQ-003 | Motion de entrada, saída e revelação por letras/seções com função narrativa | todas | todos | P0 | interaction | aprovado | letras escalonadas, IntersectionObserver e transições de rota |
| RQ-004 | Profundidade 3D com fallback | `/` | todos | P1 | visual + accessibility | aprovado | órbitas/tilt e media query reduced-motion |
| RQ-005 | Galeria 1 contém somente arquivos `1 (*)` na ordem | `/` | todos | P0 | content | aprovado | array isolado + narrativa por scroll |
| RQ-006 | Galeria 2 contém somente arquivos `2 (*)` na ordem | `/` | todos | P0 | content | aprovado | array isolado + narrativa por scroll |
| RQ-007 | Galeria 3 contém somente arquivos `3 (*)` na ordem | `/` | todos | P0 | content | aprovado | array isolado + narrativa por scroll |
| RQ-008 | Dois vídeos reais, responsivos e pausados fora da viewport | `/` | todos | P1 | interaction + technical | aprovado | ambos reproduziram visíveis e pausaram fora da tela |
| RQ-009 | Home completa com proposta, mídia, coleções, horários e CTA | `/` | todos | P0 | content + conversion | aprovado | DOM + teste de renderização |
| RQ-010 | Página de links coerente e não genérica | `/instagram` | mobile | P0 | conversion + visual | aprovado | preview visual + DOM |
| RQ-011 | Instagram oficial acessível pelo identificador informado | todas | todos | P0 | conversion | aprovado | URL verificada no DOM e teste |
| RQ-012 | CTA visível na primeira dobra | todas | mobile | P0 | conversion | aprovado | CSS mobile-first + preview |
| RQ-013 | Navegação por teclado, foco visível e touch targets | todas | todos | P0 | accessibility | aprovado | controles semânticos + CSS de foco |
| RQ-014 | Reduced motion mantém conteúdo e funções | todas | todos | P0 | accessibility | aprovado | CSS de fallback sem ocultar conteúdo |
| RQ-015 | Nenhum fato comercial não confirmado | todas | todos | P0 | content | aprovado | revisão contra source-of-truth |
| RQ-016 | Galerias avançam exclusivamente pelo scroll, sem botões ou autoplay | `/` | todos | P0 | interaction | aprovado | sticky stories e progresso ligado à rolagem |
| RQ-017 | Nenhuma fotografia editorial é repetida dentro da mesma rota | todas | todos | P0 | content | aprovado | inventário automatizado por rota; a rota social reutiliza séries da home por pedido posterior |
| RQ-018 | Remover a seção e os ornamentos tipográficos “HJ” | todas | todos | P0 | visual | aprovado | busca de código e inspeção visual |
| RQ-019 | Exibir WhatsApp como indisponível até haver número confirmado | todas | todos | P0 | conversion + content | aprovado | botões `disabled`, sem `href` |
| RQ-020 | Usar a sequência `frames logo` na ordem visual, independentemente dos saltos na numeração dos arquivos | `/` | todos | P0 | content + technical | aprovado | 122 quadros ordenados e processados sem lacunas visuais |
| RQ-021 | Abrir a home com a formação da borboleta e só então revelar o site e iniciar as demais entradas | `/` | todos | P0 | interaction + narrative | aprovado | abertura cronometrada, evento `helena:intro-complete` e animações do hero pausadas até a conclusão |
| RQ-022 | Converter o movimento intermediário da borboleta em loop contínuo dirigido pelo scroll | `/` | todos | P0 | interaction | aprovado | quadros 96–111 em sprite; quadro derivado de `scrollY`, sem autoplay |
| RQ-023 | Manter a borboleta discreta, perceptível e sem prejudicar leitura ou interação | `/` | todos | P0 | UX + visual | aprovado | baixa opacidade, `pointer-events: none`, adaptação claro/escuro e desaparecimento antes do rodapé |
| RQ-024 | Desativar a abertura e a borboleta animada para reduced motion e economia de dados | `/` | todos | P0 | accessibility + performance | aprovado | fallback imediato e conteúdo integralmente disponível |
| RQ-025 | Recriar a sequência da marca em alta resolução e eliminar o halo verde | `/` | todos | P0 | visual + technical | aprovado | WebP 720 px, fallback lossless e sprite com células de 512 px |
| RQ-026 | Tornar o WhatsApp visualmente evidente sem ativá-lo antes do número confirmado | todas | todos | P0 | conversion + content | aprovado | CTAs bronze de alto contraste, `disabled`, sem URL de WhatsApp |
| RQ-027 | Distribuir CTAs ao longo da home | `/` | todos | P0 | conversion | aprovado | hero, três galerias, três pontes e rodapé |
| RQ-028 | Encurtar as galerias e inserir experiências distintas entre elas | `/` | todos | P0 | UX + narrative | aprovado | nova fórmula de altura e três `ExperienceBridge` |
| RQ-029 | Preparar CTA de rota sem inventar endereço ou coordenadas | todas | todos | P0 | conversion + content | aprovado | botões de rota desativados e rotulados como pendentes |
| RQ-030 | Transformar `/instagram` em Linktree personalizado inspirado nas referências | `/instagram` | todos | P0 | content + conversion | aprovado | perfil curto, links prioritários, vitrine horizontal, vídeos e fechamento |
| RQ-031 | Tornar a troca das imagens uniforme e independente da velocidade do scroll | `/` | todos | P0 | interaction + UX | aprovado | alvo interpolado em 185 ms com velocidade máxima limitada por tempo |
| RQ-032 | Priorizar a experiência mobile da home e da rota social | todas | mobile | P0 | responsive + UX | aprovado | primeira dobra compacta, CTAs em grade, stories 54/46 e página social limitada a 46 rem |
| RQ-033 | Exibir na rota social duas galerias horizontais sobrepostas que convergem e desaparecem no centro | `/instagram` | mobile | P0 | interaction + visual | aprovado | séries 1 e 2 em faixas opostas, máscara central e interpolação de 170 ms |
| RQ-034 | Reutilizar os dois vídeos na rota social em uma seção curta | `/instagram` | mobile | P0 | media | aprovado | reprodução contextual e pausa fora da viewport |
| RQ-035 | Usar o loop da borboleta de forma criativa na rota social | `/instagram` | mobile | P0 | brand + motion | aprovado | sprite animado no perfil e no encontro das faixas |
| RQ-036 | Preparar e publicar as duas rotas no projeto Vercel existente | todas | todos | P0 | deployment | aprovado | build Next estático e alias de produção validados com HTTP 200 |
