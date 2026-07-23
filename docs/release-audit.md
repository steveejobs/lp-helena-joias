# Auditoria de liberação

| Rota | Viewport | Ambiente | Build | Resultado | Evidência |
|---|---|---|---|---|---|
| `/` | desktop | Vercel produção | build validado | aprovado | formação HQ, CTAs, galerias compactas e transição limitada por tempo |
| `/instagram` | desktop | Vercel produção | build validado | aprovado | canvas centralizado, links prioritários, galeria convergente e vídeos |
| `/` | 390 × 844 | emulação touch + produção | build validado | aprovado | hero sem cortes, galeria 54/46, CTAs evidentes e transições uniformes |
| `/instagram` | 390 × 844 | emulação touch + produção | build validado | aprovado | quatro links imediatos, oito fotos, dois vídeos, duas borboletas e safe areas |

## Validações executadas

- Build de produção e artefato Sites aprovados.
- Lint aprovado sem avisos da aplicação.
- Seis testes de contrato aprovados: metadata, home completa, rota `/instagram`, unicidade das fotografias, integridade dos assets HQ e segurança dos CTAs pendentes.
- Os 122 arquivos de `frames logo`, mesmo numerados em saltos de 2, foram normalizados pela ordem visual; a formação usa os quadros iniciais e o loop sem salto perceptível usa os quadros 96–111.
- O fundo verde foi removido com reconstrução pelo quadro-base, matte suave, despill e reposição de bronze nas bordas. A sequência final foi revisada em pranchas sobre fundo rosé e escuro.
- A abertura mantém o hero e suas letras pausados até o evento de conclusão; depois, cabeçalho, tipografia e fotografia iniciam suas próprias entradas.
- A borboleta do scroll foi verificada com opacidade progressiva, troca de contraste entre superfícies claras/escuras, ausência de captura de ponteiro e fade total antes do rodapé.
- As galerias da home preservam suas séries com interpolação temporal de 185 ms, `smootherstep` e velocidade máxima limitada; a apresentação não depende da força do gesto.
- No mobile, a composição sticky da home usa divisão aproximada de 54/46 entre imagem e narrativa, reservando mais espaço para leitura e ação.
- Três pontes comerciais diferentes foram incluídas entre e após as galerias; todas possuem entrada de seção e CTAs intermediários.
- Botões manuais e autoplay foram removidos das galerias; zoom, corte e progresso são derivados da posição de rolagem.
- A seção/ornamentos “HJ” permanecem removidos. O WhatsApp ganhou alto contraste e continua semanticamente desativado nas duas rotas; a rota também permanece desativada sem endereço confirmado.
- As três referências `/instagram` foram reabertas e comparadas nesta iteração; a Helena aplica a apresentação curta, vitrine imediata, hierarquia de links e fechamento audiovisual sem copiar identidade ou fatos comerciais.
- O `/instagram` foi reduzido a um Linktree editorial mobile-first: quatro links aparecem na primeira dobra, seguidos por duas galerias horizontais que avançam em sentidos opostos, convergem e desaparecem por máscara central.
- A galeria convergente usa oito fotografias, interpolação de 190 ms, velocidade limitada, dissolução progressiva e uma borboleta discreta no encontro. Os dois vídeos existentes compõem o fechamento da experiência.
- Os CTAs pendentes mantêm aparência ativa e alto contraste, mas permanecem semanticamente desativados e sem destinos inventados.
- Navegação com cortina de saída entre `/instagram` e `/` concluída.
- DOM contém um único H1 por rota, headings ordenados, links reais, botões reais e textos alternativos.
- Conteúdo revisto contra `source-of-truth.md`; nenhum número de WhatsApp foi inventado e o CTA permanece inativo.
- Lint da aplicação, TypeScript, build Next/Vercel e `git diff --check` aprovados.
- Produção Vercel publicada no projeto existente e validada com HTTP 200 em `/`, `/instagram`, fotografia e vídeo.

## Limitações verificadas

- O identificador salvo em `.openai/hosting.json` não foi encontrado pelo conector Sites; a publicação solicitada foi concluída pelo projeto Vercel já existente.
