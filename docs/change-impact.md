# Matriz de impacto

| Arquivo alterado | Componentes | Rotas afetadas | Requisitos afetados | Testes obrigatórios |
|---|---|---|---|---|
| `app/page.tsx` | Home, BrandIntro, ScrollButterfly, Hero, ScrollGallery, ExperienceBridge, SmartVideo | `/` | RQ-001–RQ-009, RQ-011–RQ-029 | desktop/mobile, abertura HQ, entradas, scroll da borboleta, galerias compactas, CTAs, rota pendente, reduced motion/save-data |
| `app/instagram/page.tsx` | Experiência social Liquid3 | `/instagram` | RQ-001–RQ-004, RQ-010–RQ-019, RQ-026–RQ-030 | mobile/desktop, apresentação da loja, links, saída, CTAs inativos, ausência de foto repetida |
| `app/globals.css` | sistema visual, abertura da marca, motion e scroll-driven galleries | todas | RQ-001–RQ-004, RQ-012–RQ-024 | overflow, contraste, entradas, scroll, claro/escuro, reduced motion |
| `app/layout.tsx` | metadata e idioma | todas | RQ-011, RQ-015 | título, descrição, favicon |
| `public/media/logo-formation-v2.webp` | sequência transparente HQ da formação da marca | `/` | RQ-020–RQ-025 | transparência, ausência de halo verde, duração, nitidez e reprodução única |
| `public/media/butterfly-scroll-sprite-v2.webp` | sprite 4×4 HQ do loop de asas | `/` | RQ-022–RQ-025 | integridade dos 16 quadros, células 512 px, resposta ao scroll e fallback |
