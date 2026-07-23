# Manifesto de assets

| Arquivo | Tipo | Dimensões | Peso aprox. | Série | Conteúdo | Uso | Status |
|---|---|---:|---:|---|---|---|---|
| `logo-background.jpg` | JPG | 828×828 | 59 KB | identidade | borboleta geométrica, fundo rosé e metal bronze | referência cromática | aprovado |
| `logo-transparent.png` | PNG | 828×828 | 65 KB | identidade | logo sem fundo | navegação e rodapé | aprovado |
| `logo-formation-v2.webp` | WebP animado | 720×720 | 2,8 MB | identidade | formação transparente da borboleta em 44 quadros, matte reconstruído | abertura retina da home, reprodução única | aprovado |
| `logo-formation-final-v2.webp` | WebP lossless | 720×720 | 153 KB | identidade | estado final transparente em alta resolução | fallback visual da sequência | aprovado |
| `butterfly-scroll-sprite-v2.webp` | WebP lossless | 2048×2048 | 1,5 MB | identidade | sprite 4×4, 16 poses em células de 512 px | borboleta conduzida pelo scroll | aprovado |
| `gallery-1-1.jpg` | JPG | 1170×1560 | 148 KB | 1 | modelo com joias douradas | galeria 1 | aprovado |
| `gallery-1-2.jpg` | JPG | 1170×1560 | 170 KB | 1 | modelo com joias claras | galeria 1 | aprovado |
| `gallery-1-3.jpg` | JPG | 1170×1560 | 84 KB | 1 | detalhe de anéis e pulseiras | galeria 1 | aprovado |
| `gallery-1-4.jpg` | JPG | 1170×1560 | 180 KB | 1 | retrato com brinco e colares | galeria 1 | aprovado |
| `gallery-2-1.jpg` | JPG | 1170×1560 | 136 KB | 2 | joias douradas de volume | galeria 2 | aprovado |
| `gallery-2-2.jpg` | JPG | 1170×1560 | 120 KB | 2 | conjunto dourado em loja | galeria 2 | aprovado |
| `gallery-2-3.jpg` | JPG | 1170×1560 | 118 KB | 2 | colar e bracelete esculturais | galeria 2 | aprovado |
| `gallery-2-4.jpg` | JPG | 1170×1560 | 149 KB | 2 | composição dourada com clutch | galeria 2 | aprovado |
| `gallery-3-1.jpg` | JPG | 3024×3584 | 2.27 MB | 3 | look azul e acessórios | galeria 3 | aprovado |
| `gallery-3-2.jpg` | JPG | 2268×2680 | 1.64 MB | 3 | close com óculos e brincos | galeria 3 | aprovado |
| `gallery-3-3.jpg` | JPG | 3024×3584 | 2.09 MB | 3 | look azul em frente à loja | galeria 3 | aprovado |
| `atelier-1.mp4` | MP4 | 720×1280 | 0.89 MB | vídeo | look preto, bolsa e joias | seção de movimento | aprovado |
| `atelier-2.mp4` | MP4 | 720×1280 | 0.52 MB | vídeo | mosaico de peças douradas | seção de movimento | aprovado |

## Regra de agrupamento

As séries 1, 2 e 3 permanecem independentes, na ordem original. Nenhuma galeria reutiliza ou intercala imagem de outra série.

Os 122 quadros da marca foram ordenados pelo valor numérico do nome do arquivo, não pela expectativa de uma sequência contígua. A abertura v2 deriva dos quadros 0–43; o loop usa os quadros normalizados 96–111 porque o quadro seguinte retorna ao início com a menor diferença visual observada. O fundo foi reconstruído a partir do quadro-base; bordas antialias receberam despill e reposição de cor bronze para eliminar o halo verde sem alterar a geometria.

## Paleta extraída da logo com fundo

- Rosé de base: `#FADCD4`
- Rosé médio: `#E6C7B5`
- Areia quente: `#D0B095`
- Bronze claro: `#B4936E`
- Bronze profundo: `#997746`
- Contraste editorial complementar: `#211916`
