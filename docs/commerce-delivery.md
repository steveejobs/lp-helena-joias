# Entrega da loja digital Helena Joias

Data da validação: 27/07/2026  
Store ID Helena: `22222222-2222-4222-8222-222222222222`  
Store slug: `helena-joias`

## Resultado

A home, `/instagram`, galerias, fotografias, vídeos, abertura animada,
borboleta, movimentos e identidade visual originais foram preservados. A
infraestrutura passou a atender Vision e Helena no mesmo Supabase sem misturar
dados comerciais ou administrativos.

Foram entregues:

- catálogo editorial em `/loja` e `/loja/[categoria]`;
- produto em `/produto/[slug]`;
- sacola persistida em `localStorage`, drawer e `/carrinho`;
- composição de pedido e atendimento por WhatsApp;
- administração protegida de produtos, categorias, imagens e configurações;
- analytics first-party e dashboard por loja;
- busca e filtros persistidos na URL;
- SVGs autorais para as cinco categorias;
- preview editorial dinâmica dentro da home;
- SEO, sitemap, robots, breadcrumbs e dados estruturados condicionais.

Não há produto, preço, telefone, avaliação, endereço ou dado comercial
inventado. O catálogo Helena permanece vazio até o cadastro dos produtos reais.

## Migrations aplicadas

1. `20260726220000_multistore_helena_foundation.sql`
2. `20260726233000_helena_variant_isolation_and_storage.sql`
3. `20260726234500_helena_runtime_image_compatibility.sql`
4. `20260727090000_analytics_v2_event_types.sql`
5. `20260727090500_analytics_v2_sessions_and_reporting.sql`
6. `20260727100000_analytics_v2_report_refinements.sql`

As migrations foram aplicadas incrementalmente no projeto Supabase
`uwspaoysziftmmwnceud`. Nenhuma tabela foi truncada, nenhuma coluna da Vision foi
removida e nenhuma migration local posterior da Vision foi aplicada por
acidente.

Validação pós-migration:

| Verificação | Resultado |
| --- | ---: |
| lojas | 2 |
| categorias Helena | 5 |
| produtos Helena | 0 |
| imagens Helena | 0 |
| eventos Helena | 0 |
| produtos Vision | 5 |
| imagens Vision | 8 |
| produtos sem `store_id` | 0 |
| imagens sem `store_id` | 0 |
| variantes sem `store_id` | 0 |

As instruções de backup prévio estão em `docs/commerce-audit.md`. Como rollback,
as migrations devem ser revertidas somente por uma migration nova e revisada.
Não executar `reset`, `truncate` ou remoção das colunas multiempresa. Se for
necessário desativar a Helena sem apagar dados, use `stores.active = false`.

## Estrutura final do banco

Entidades centrais:

- `stores`;
- `profiles`, agora associado à loja;
- `categories`;
- `products`;
- `product_images`;
- `product_image_variants`;
- `analytics_events`;
- demais entidades legadas da Vision, todas compatibilizadas com `store_id`.

Slugs e SKUs comerciais usam unicidade composta por loja. Relacionamentos
comerciais usam chaves compostas com `store_id` quando o schema legado permite.
Os aliases antigos (`published`, `display_order`, `is_cover`) continuam
sincronizados com os novos campos (`status`, `sort_order`, `is_primary`).

## Isolamento e segurança

- toda função de repositório exige um `StoreContext`;
- toda consulta comercial da Helena contém filtro explícito por `store_id`;
- o servidor resolve a loja por domínio, mapa de domínios ou slug de ambiente;
- formulários administrativos nunca recebem nem aceitam `store_id`;
- o perfil autenticado precisa estar ativo e ligado à Helena;
- RLS de perfis, produtos, categorias, imagens, variantes, configurações e
  analytics exige a loja do usuário;
- o Storage da Helena aceita somente
  `stores/{store_id}/products/{product_id}/{uuid}.webp`;
- uploads validam extensão, MIME declarado, assinatura binária, dimensões,
  tamanho e vínculo do produto com a loja;
- imagens de rascunhos não são servidas pela API pública;
- chave administrativa existe apenas no servidor;
- inputs, UUIDs, slugs, valores, paths e metadados de analytics são validados;
- o endpoint de analytics tem allowlist de eventos, limite de payload e rate
  limit por sessão.

## Variáveis de ambiente

Copiar `.env.example` para o gerenciador seguro do ambiente:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_STORE_SLUG=helena-joias
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
STORE_DOMAIN_MAP
HELENA_ADMIN_EMAILS
```

`SUPABASE_SECRET_KEY` nunca pode receber prefixo `NEXT_PUBLIC_`.

O arquivo `chaves vision.json` informado contém credenciais do Google
Analytics/GA4, não do banco. Ele não foi copiado para o projeto nem exposto no
bundle. A camada first-party foi mantida independente para evitar duplicação
cega de eventos.

## Provisionar o primeiro administrador

1. Criar ou convidar o usuário em **Supabase Auth → Users**.
2. No SQL Editor, com o UUID real desse usuário, executar:

```sql
update public.profiles
set
  store_id = '22222222-2222-4222-8222-222222222222',
  role = 'admin',
  active = true
where id = '<UUID_REAL_DO_USUARIO>';
```

3. Adicionar o e-mail a `HELENA_ADMIN_EMAILS` se a allowlist estiver ativa.
4. Entrar em `/admin/login`.

Sem esse provisionamento, `/admin` redireciona para o login e nenhuma edição
fica pública.

## Cadastrar produtos

1. Entrar em `/admin/produtos`.
2. Informar nome, categoria, descrição breve e preço opcional.
3. Salvar o rascunho e escolher uma foto JPEG, PNG ou WebP.
4. Conferir a prévia, imagem principal, ordem e texto alternativo.
5. Usar o botão guiado **Publicar produto**.

Produtos ativos precisam de imagem principal válida. A exclusão definitiva não
existe na interface comum; use **Arquivar produto**.

O navegador converte JPEG, PNG ou WebP de até 20 MB para um WebP otimizado,
limitado a 2400 px. O servidor recebe somente o resultado WebP e valida
assinatura binária, dimensão, tamanho e namespace da loja. A Vision mantém
intacto o contrato legado de cinco derivados.

## Configurar WhatsApp

1. Abrir `/admin/configuracoes`.
2. Informar o telefone com DDI, por exemplo `55...`.
3. Definir a mensagem padrão opcional.
4. Salvar.

O telefone é normalizado e lido apenas da configuração da loja. Enquanto estiver
vazio, todos os botões continuam visíveis, informam que o atendimento está em
configuração e não geram link falso.

## Eventos rastreados

- `session_started`
- `page_view`
- `category_view`
- `category_clicked`
- `product_impression`
- `product_view`
- `product_clicked`
- `search_performed`
- `filter_applied`
- `add_to_cart`
- `remove_from_cart`
- `cart_viewed`
- `quantity_changed`
- `begin_whatsapp_checkout`
- `whatsapp_opened`
- `instagram_clicked`
- `page_engagement`
- `search_zero_results`
- `checkout_product`
- `cart_cleared`

O navegador mantém um UUID anônimo de visitante e outro de sessão, renovado
após 30 minutos de inatividade. Não são coletados nome, telefone, e-mail, texto
da mensagem, IP, GPS, endereço ou bairro. Impressões exigem 45% de visibilidade
por 800 ms e são deduplicadas por sessão.

## Arquivos principais

Criados:

- `app/store.css` e `app/admin.css`;
- rotas `app/loja`, `app/produto`, `app/carrinho` e `app/admin`;
- APIs `app/api/analytics`, `app/api/catalog-preview` e
  `app/api/media/product`;
- componentes em `components/store`, `components/cart`, `components/admin`,
  `components/analytics` e `components/home`;
- módulos em `lib/catalog`, `lib/cart`, `lib/whatsapp`, `lib/analytics`,
  `lib/auth`, `lib/admin`, `lib/store` e `lib/supabase`;
- migrations em `supabase/migrations`;
- testes de sacola em `tests/cart.test.mjs`.

Modificados:

- `app/page.tsx`, `app/instagram/page.tsx`, `app/layout.tsx`;
- `app/globals.css`, `app/sitemap.ts`, `app/robots.ts`;
- `package.json`, `package-lock.json`, `tsconfig.json`,
  `eslint.config.mjs` e `.gitignore`;
- `tests/rendered-html.test.mjs`.

## Validação

- build Vinext/Sites: aprovado;
- artefato Worker e hosting manifest: aprovados;
- TypeScript: aprovado;
- ESLint completo: aprovado;
- testes Node: 10/10 aprovados;
- rotas verificadas sem erro de console:
  `/`, `/loja`, `/carrinho`, `/instagram`, `/admin/login`;
- larguras verificadas sem overflow:
  360, 390, 393, 412, 430, 768, 844 horizontal e 1440 px;
- menu mobile e sacola: touch targets de 44 px;
- home e preview: `prefers-reduced-motion` e economia de dados preservados;
- vídeos: pausam fora da viewport e quando a aba fica oculta.

## Evidências visuais

- `docs/evidence/home-store-desktop.png`
- `docs/evidence/home-store-mobile.png`
- `docs/evidence/shop-desktop.png`
- `docs/evidence/shop-mobile.png`
- `docs/evidence/cart-mobile.png`
- `docs/evidence/admin-login-mobile.png`

## Limitações honestas

- não foi criado administrador porque nenhum e-mail autorizado foi fornecido;
- não há screenshots de produto real ou dashboard autenticado porque a Helena
  ainda não possui produtos nem usuário administrativo;
- WhatsApp permanece desconfigurado até o número real ser cadastrado;
- o mapa depende de um provedor de tiles; o padrão OpenStreetMap é adequado para
  uso administrativo moderado e pode ser substituído por variável de ambiente;
- o dashboard autenticado só poderá receber screenshot com dados reais após o
  provisionamento do primeiro administrador e a chegada de tráfego real.
