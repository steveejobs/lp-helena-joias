# Analytics first-party v2

Validado em 27/07/2026 para a loja Helena
(`22222222-2222-4222-8222-222222222222`).

## O que agora é medido

- visitante anônimo (`client_id`) separado de sessão (`session_id`);
- nova sessão após 30 minutos sem atividade;
- visualizações de páginas, produtos, categorias e impressões reais;
- clique em produto e origem do componente;
- busca, busca sem resultado e filtros;
- adição, remoção, quantidade, limpeza e visualização da sacola;
- intenção de WhatsApp geral e por produto;
- tempo engajado apenas enquanto a página está visível;
- entrada, saída, páginas mais vistas e recorrência;
- dispositivo, navegador e sistema operacional em categorias genéricas;
- origem, referrer e UTMs preservados durante a sessão;
- cidade, região e país aproximados pelo Cloudflare;
- funil, abandono de sacola, CTR e comparação de período.

Cada evento recebe `event_id` único. O banco usa
`unique (store_id, event_id)`, portanto uma repetição de rede não duplica a
métrica. A adição à sacola possui uma única fonte de emissão.

## Privacidade geográfica

A aplicação não solicita GPS e não armazena IP, CEP, endereço ou bairro. O
servidor usa os campos geográficos do `request.cf` no Cloudflare ou os
cabeçalhos `x-vercel-ip-*` na Vercel, remove precisão e grava
latitude/longitude com apenas uma casa decimal. O dashboard agrega por cidade e
limita o mapa a zoom 8.

O mapa usa Leaflet com tiles reais. Sem configuração, usa os tiles padrão do
OpenStreetMap com atribuição visível. Para operação com maior tráfego, configure
um provedor de tiles compatível:

```text
NEXT_PUBLIC_ANALYTICS_TILE_URL=https://provedor/{z}/{x}/{y}.png
```

## GA4

O painel próprio continua sendo a fonte first-party. Para conectar a nova conta
GA4, configure somente o ID público:

```text
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

`send_page_view` fica desativado na configuração automática do GA4 porque
`page_view` já nasce na camada canônica. Os mesmos eventos são enviados ao
destino opcional sem alterar as contagens do dashboard próprio. Não adicionar
outro snippet manual de `gtag` em paralelo.

## Dashboard

`/admin/analytics` mostra:

- páginas vistas, sessões e pessoas ativas nos últimos cinco minutos;
- tempo engajado e duração média;
- novos e recorrentes;
- funil produto → sacola → WhatsApp;
- abandono de sacola e buscas sem resultado;
- desempenho por produto: impressão, clique, view, sacola, WhatsApp e CTR;
- gráfico diário;
- mapa e ranking de cidades;
- categorias, buscas, fontes, campanhas, entradas e saídas;
- dispositivos, navegadores e sistemas operacionais.

Nenhum número é simulado. Estados vazios permanecem visíveis até a chegada de
tráfego real.

## Banco e isolamento

Migrations:

1. `20260727090000_analytics_v2_event_types.sql`
2. `20260727090500_analytics_v2_sessions_and_reporting.sql`
3. `20260727100000_analytics_v2_report_refinements.sql`

`analytics_sessions` possui RLS e só permite leitura por administrador ativo da
mesma `store_id`. O RPC do dashboard não recebe `store_id`: ele resolve a loja
do perfil autenticado. O RPC de ingestão aceita `store_id` apenas do backend e
tem `EXECUTE` concedido exclusivamente ao `service_role`.

## Cadastro de produto

O fluxo agora é guiado:

1. nome, categoria, descrição breve e preço opcional;
2. fotos;
3. revisão e publicação.

Slug, ordem, SKU e descrição longa ficam fora do caminho principal. O primeiro
salvamento cria um rascunho. JPEG, PNG e WebP de até 20 MB são convertidos no
navegador para WebP, limitados a 2400 px e apresentados em prévia. O servidor
continua validando assinatura real, extensão, dimensões, tamanho, produto e
loja. A publicação só é liberada com imagem principal válida.
