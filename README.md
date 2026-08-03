# Helena Joias

Landing page institucional da Helena Joias, construída com Next.js e React.
O projeto é totalmente independente de banco de dados e autenticação.

## Requisitos

- Node.js 24

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

- `app/`: landing page, experiência para Instagram e página de privacidade.
- `components/`: componentes visuais e interativos.
- `lib/`: copy da marca e integração com WhatsApp.
- `public/media/`: ativos visuais utilizados pelo site.

O site não usa banco, login, cookies ou ferramentas de analytics. Nenhuma
variável de ambiente é obrigatória.

O deploy de produção utiliza o comando `npm run build:vercel`, configurado em
`vercel.json`.
