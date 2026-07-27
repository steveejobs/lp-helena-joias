# Helena Joias

Loja online e painel administrativo da Helena Joias, construídos com Next.js,
React, Supabase e Vercel.

## Requisitos

- Node.js 24
- Projeto Supabase vinculado
- Variáveis descritas em `.env.example`

## Desenvolvimento

```bash
npm install
npm run dev
```

A aplicação local fica disponível em `http://localhost:3000`.

## Comandos

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera o build de produção.
- `npm run start`: executa o build local.
- `npm run typecheck`: valida os tipos TypeScript.
- `npm run lint`: executa o ESLint.

## Estrutura principal

- `app/`: páginas públicas, catálogo, produto e painel administrativo.
- `components/`: componentes visuais e interativos.
- `lib/`: catálogo, autenticação, analytics e integração com Supabase.
- `public/media/`: ativos visuais utilizados pelo site.
- `supabase/`: migrations e configuração do banco.

O deploy de produção utiliza o comando `npm run build:vercel`, configurado em
`vercel.json`.
