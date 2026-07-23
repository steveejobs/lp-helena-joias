# Auditoria de liberação

| Rota | Viewport | Ambiente | Build | Resultado | Evidência |
|---|---|---|---|---|---|
| `/` | desktop | build + contrato | local validado | aprovado estruturalmente | formação HQ, CTAs, galerias compactas, três pontes e borboleta por scroll |
| `/instagram` | desktop | build + contrato | local validado | aprovado estruturalmente | apresentação da loja, descoberta, ritual, visita e contatos pendentes |
| `/` | mobile | regras responsivas | build validado | aprovado com CSS responsivo | breakpoints, galerias mais curtas, pontes em pilha e CTAs evidentes |
| `/instagram` | mobile | regras responsivas | build validado | aprovado com CSS responsivo | links em pilha, seções editoriais, safe areas e touch targets |

## Validações executadas

- Build de produção e artefato Sites aprovados.
- Lint aprovado sem avisos da aplicação.
- Seis testes de contrato aprovados: metadata, home completa, rota `/instagram`, unicidade das fotografias, integridade dos assets HQ e segurança dos CTAs pendentes.
- Os 122 arquivos de `frames logo`, mesmo numerados em saltos de 2, foram normalizados pela ordem visual; a formação usa os quadros iniciais e o loop sem salto perceptível usa os quadros 96–111.
- O fundo verde foi removido com reconstrução pelo quadro-base, matte suave, despill e reposição de bronze nas bordas. A sequência final foi revisada em pranchas sobre fundo rosé e escuro.
- A abertura mantém o hero e suas letras pausados até o evento de conclusão; depois, cabeçalho, tipografia e fotografia iniciam suas próprias entradas.
- A borboleta do scroll foi verificada com opacidade progressiva, troca de contraste entre superfícies claras/escuras, ausência de captura de ponteiro e fade total antes do rodapé.
- As três galerias preservam suas séries e efeitos — recorte vertical, recorte lateral e expansão circular — com altura reduzida de cerca de 43% no desktop e 45% no mobile.
- Três pontes comerciais diferentes foram incluídas entre e após as galerias; todas possuem entrada de seção e CTAs intermediários.
- Botões manuais e autoplay foram removidos das galerias; zoom, corte e progresso são derivados da posição de rolagem.
- A seção/ornamentos “HJ” permanecem removidos. O WhatsApp ganhou alto contraste e continua semanticamente desativado nas duas rotas; a rota também permanece desativada sem endereço confirmado.
- As três referências `/instagram` foram abertas e comparadas; a Helena usa seus princípios de hierarquia e conversão sem copiar identidade ou fatos comerciais.
- Navegação com cortina de saída entre `/instagram` e `/` concluída.
- DOM contém um único H1 por rota, headings ordenados, links reais, botões reais e textos alternativos.
- Conteúdo revisto contra `source-of-truth.md`; nenhum número de WhatsApp foi inventado e o CTA permanece inativo.
- Lint, build de produção, manifesto Sites e `git diff --check` aprovados.

## Limitações verificadas

- A prévia local iniciou e permaneceu saudável, mas o navegador controlado bloqueou o endereço interno antes de carregar a página. Por isso, esta revisão não possui nova captura física das rotas; a validação final desta iteração é estrutural, de build, contrato e QA separado dos assets transparentes.
