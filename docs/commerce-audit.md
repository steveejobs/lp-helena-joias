# Auditoria da loja digital — 26/07/2026

## Estado atual da Helena

- Framework: Next.js 16.2.6, React 19.2.6 e TypeScript 5.9.
- Runtime principal: Vinext/Vite sobre Cloudflare Workers, preparado para OpenAI Sites.
- Estilos: CSS autoral em `app/globals.css`, sem biblioteca visual ou kit de componentes.
- Rotas existentes: `/` e `/instagram`, ambas no App Router.
- Banco local declarado: Drizzle para Cloudflare D1, mas `db/schema.ts` está vazio e o binding D1 está desativado.
- Storage local declarado: R2 opcional, sem binding ativo.
- Autenticação disponível: helpers de Sign in with ChatGPT, ainda não usados pela interface.
- Estado atual: home editorial completa, rota de links/Instagram, galerias, vídeos, abertura animada, borboleta em canvas, transições e SEO.

## Banco compartilhado identificado

A outra loja está em `lp-otica-vision` e usa:

- Supabase/PostgreSQL;
- Supabase Auth com cadastro público desativado;
- Supabase Storage privado;
- RLS, auditoria e funções administrativas no banco;
- clientes público, SSR e administrativo separados;
- migrations SQL versionadas em `supabase/migrations`.

Contagens remotas antes da mudança:

| Entidade | Linhas |
| --- | ---: |
| perfis | 4 |
| marcas | 1 |
| categorias | 0 |
| produtos | 5 |
| imagens de produto | 8 |
| coleções | 2 |
| galerias | 4 |
| eventos de analytics | 1.163 |
| configurações | 4 |

O banco remoto ainda não possui `stores`. As migrations remotas chegam a
`20260720130500`; três migrations locais posteriores da Vision ainda não foram
aplicadas e não serão incluídas implicitamente nesta entrega.

O arquivo `chaves vision.json` contém configuração do GA4 e uma conta de serviço
do Google Analytics. Ele não é uma credencial de banco e não deve ser copiado
para o repositório, bundle do navegador ou variáveis públicas.

## O que será preservado

- toda a home atual, inclusive hero, galerias e ritmo editorial;
- a animação de abertura e a borboleta;
- vídeos, posters, fotografias, logos e demais materiais;
- `/instagram` e sua identidade própria;
- metadados, sitemap e robots existentes;
- movimentos responsáveis por `prefers-reduced-motion`, economia de dados e
  visibilidade da aba;
- os dados, autenticação, storage e funcionamento atual da Vision.

## O que será criado

- extensão multiempresa incremental no Supabase compartilhado;
- resolução central da loja por domínio, slug e variável de ambiente;
- catálogo, categoria, produto, busca e filtros;
- ícones SVG autorais de categorias;
- sacola persistida e atendimento pelo WhatsApp;
- administração protegida e autorizada por loja;
- uploads com namespace da loja;
- analytics first-party e dashboard por loja;
- uma prévia editorial compacta da loja dentro da home;
- documentação de operação, segurança, backup e rollback.

## Riscos e controles

1. **Unicidade global existente.** Slugs e SKUs são globais na Vision. A migration
   precisa substituir apenas as constraints necessárias por unicidade composta,
   preservando os nomes e valores atuais.
2. **RLS monoempresa.** As políticas atuais verificam papel, mas não loja. A
   autorização será ampliada para exigir `store_id` tanto em leitura quanto em
   escrita.
3. **Storage legado.** Objetos atuais usam caminhos sem o prefixo `stores/`.
   Eles serão mantidos e associados à Vision; novos uploads usarão
   `stores/{store_id}/products/{product_id}/...`.
4. **Compatibilidade da Vision.** Colunas novas serão adicionadas com backfill e
   defaults seguros. Nenhuma coluna usada pela Vision será removida ou renomeada.
5. **Migrations remotas pendentes.** A migration multiempresa será independente
   das três migrations locais ainda não aplicadas.
6. **Ambiente Windows.** Os scripts chamam Bash. A validação local deve usar Git
   Bash enquanto o WSL do computador estiver desatualizado.

## Plano incremental

1. Registrar snapshot do schema, migrations e contagens.
2. Criar uma migration transacional e idempotente.
3. Criar a loja Vision e vincular todos os registros existentes.
4. Criar a Helena sem produtos fictícios e sem WhatsApp inventado.
5. Aplicar constraints, índices, funções e políticas multiempresa.
6. Validar contagens, integridade cruzada e acesso anônimo/autenticado.
7. Integrar a Helena ao Supabase usando apenas chave publicável no navegador.
8. Entregar catálogo, sacola, admin e analytics por fases, validando cada uma.

## Backup e rollback

Antes da aplicação remota:

```bash
npx supabase db dump --linked --schema public,storage --file backup-pre-multistore.sql
npx supabase db dump --linked --data-only --schema public --file backup-data-pre-multistore.sql
```

Os arquivos de backup devem ficar fora do Git. O rollback versionado deve remover
somente objetos novos quando não houver registros Helena; nunca deve apagar ou
reescrever dados da Vision automaticamente.

## Baseline de validação

- Lint do código-fonte: aprovado.
- Build Vinext/Sites: aprovado; artefato Worker e manifest validados.
- Home desktop 1440 px: aprovada visualmente.
- Home mobile 390 × 844: abertura animada preservada.
- `/instagram` mobile 390 × 844: funcional; o título largo existente será
  revisado na fase de integração para evitar corte lateral.
