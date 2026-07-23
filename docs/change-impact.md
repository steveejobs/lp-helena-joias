# Matriz de impacto

| Arquivo alterado | Componentes | Rotas afetadas | Requisitos afetados | Testes obrigatórios |
|---|---|---|---|---|
| `app/page.tsx` | Home, BrandIntro, ScrollButterfly, Hero, ScrollGallery, ExperienceBridge, SmartVideo | `/` | RQ-001–RQ-009, RQ-011–RQ-031 | desktop/mobile, abertura HQ, interpolação temporal do scroll, galerias compactas, CTAs, reduced motion/save-data |
| `app/instagram/page.tsx` | ProfileLink, ButterflyLoop, ConvergingGallery, LinkVideo | `/instagram` | RQ-001–RQ-004, RQ-010–RQ-019, RQ-026–RQ-035 | mobile-first, links, faixas convergentes, vídeos, CTAs inativos e reduced motion |
| `app/globals.css` | sistema visual, abertura da marca, motion e scroll-driven galleries | todas | RQ-001–RQ-004, RQ-012–RQ-024 | overflow, contraste, entradas, scroll, claro/escuro, reduced motion |
| `package.json`, `vercel.json`, `.vercelignore`, `tsconfig.json` | build e pacote de produção Vercel | todas | RQ-036 | TypeScript, build Next, deploy e smoke HTTP |
| `app/layout.tsx` | metadata e idioma | todas | RQ-011, RQ-015 | título, descrição, favicon |
| `public/media/logo-formation-v2.webp` | sequência transparente HQ da formação da marca | `/` | RQ-020–RQ-025 | transparência, ausência de halo verde, duração, nitidez e reprodução única |
| `public/media/butterfly-scroll-sprite-v2.webp` | sprite 4×4 HQ do loop de asas | `/` | RQ-022–RQ-025 | integridade dos 16 quadros, células 512 px, resposta ao scroll e fallback |
