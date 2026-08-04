import { siteName, siteUrl } from "@/app/seo";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  image: string;
  imageAlt: string;
  tags: string[];
  intro: string;
  sections: {
    heading: string;
    body: string[];
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "loja-de-joias-em-araguaina",
    title: "Loja de joias em Araguaína: conheça a Helena Joias no Setor Central",
    description:
      "Conheça a Helena Joias, loja de joias em Araguaína, TO, com atendimento presencial, colares, brincos, anéis, pulseiras e acessórios selecionados.",
    date: "2026-08-04",
    readingTime: "3 min",
    image: "/media/gallery-3-3.jpg",
    imageAlt: "Look com joias em frente à Helena Joias em Araguaína",
    tags: ["Araguaína", "Loja física", "Joias"],
    intro:
      "Para quem procura uma loja de joias em Araguaína, a Helena Joias reúne atendimento próximo, curadoria de peças e uma experiência pensada para escolher com calma.",
    sections: [
      {
        heading: "Onde encontrar a Helena Joias",
        body: [
          "A Helena Joias fica na Rua Sadoc Correia, 1293, Casa 3, no Setor Central de Araguaína, Tocantins. A localização facilita a visita de quem quer ver colares, brincos, anéis, pulseiras e acessórios de perto antes de escolher.",
          "A loja atende de segunda a sexta, das 08h às 18h, e aos sábados, das 08h às 12h. Também é possível iniciar o atendimento pelo WhatsApp para tirar dúvidas antes da visita.",
        ],
      },
      {
        heading: "Por que visitar uma loja física de joias",
        body: [
          "Joias e semijoias mudam muito conforme o tom da pele, a roupa, o caimento e a luz. Na loja física, você consegue provar combinações, comparar tamanhos e perceber detalhes que uma foto nem sempre mostra.",
          "Esse contato ajuda a escolher uma peça para o dia a dia, para presente ou para um momento especial com mais segurança.",
        ],
      },
      {
        heading: "Uma busca local mais precisa",
        body: [
          "Ao pesquisar por Helena Joias em Araguaína, procure pelo nome completo da loja e pela cidade. Esses sinais ajudam a diferenciar a Helena Joias local de outras marcas com nomes parecidos em outras regiões do Brasil.",
        ],
      },
    ],
  },
  {
    slug: "como-escolher-semijoias-em-araguaina",
    title: "Como escolher semijoias em Araguaína para o dia a dia",
    description:
      "Veja critérios simples para escolher semijoias em Araguaína: acabamento, proporção, ocasião, conforto e atendimento presencial na Helena Joias.",
    date: "2026-08-04",
    readingTime: "4 min",
    image: "/media/gallery-1-3.jpg",
    imageAlt: "Anéis e pulseiras em detalhe na Helena Joias",
    tags: ["Semijoias", "Acessórios", "Araguaína"],
    intro:
      "Escolher semijoias para o dia a dia envolve mais do que gostar de uma peça isolada. O melhor resultado aparece quando acabamento, conforto e estilo conversam com a rotina de quem vai usar.",
    sections: [
      {
        heading: "Observe acabamento e proporção",
        body: [
          "Antes de decidir, veja o brilho, o peso visual, o fecho e o acabamento da peça. Brincos, colares, anéis e pulseiras precisam combinar com o uso real: trabalho, eventos, presentes ou produções mais marcantes.",
          "Peças delicadas funcionam bem para uso frequente. Já acessórios com mais volume criam presença imediata e podem transformar uma composição simples.",
        ],
      },
      {
        heading: "Prove combinações",
        body: [
          "Camadas de colares, mix de anéis e pulseiras pedem equilíbrio. Na Helena Joias, em Araguaína, a visita presencial permite testar proporções e encontrar combinações que valorizam o rosto, as mãos e o estilo pessoal.",
          "Esse processo evita compras por impulso e ajuda a escolher peças que realmente entram na rotina.",
        ],
      },
      {
        heading: "Pense na ocasião",
        body: [
          "Para presentes, vale considerar peças versáteis, como pontos de luz, argolas, pulseiras finas e colares delicados. Para eventos, acessórios geométricos, dourados ou com mais presença podem criar um resultado mais expressivo.",
        ],
      },
    ],
  },
  {
    slug: "presentes-com-joias-em-araguaina",
    title: "Presentes com joias em Araguaína: ideias para datas especiais",
    description:
      "Ideias de presentes com joias e semijoias em Araguaína para aniversário, formatura, Dia das Mães, Dia dos Namorados e momentos especiais.",
    date: "2026-08-04",
    readingTime: "3 min",
    image: "/media/gallery-2-2.jpg",
    imageAlt: "Composição dourada de colares, brincos e anéis Helena Joias",
    tags: ["Presentes", "Datas especiais", "Araguaína"],
    intro:
      "Joias são presentes memoráveis porque acompanham a pessoa depois da data. A escolha certa combina beleza, intenção e um pouco da rotina de quem vai receber.",
    sections: [
      {
        heading: "Presentes delicados e versáteis",
        body: [
          "Para quem prefere escolhas seguras, peças delicadas costumam funcionar muito bem. Colares finos, brincos pequenos, pulseiras leves e anéis discretos entram facilmente no dia a dia.",
          "Essas opções são boas para aniversário, agradecimento, lembranças afetivas e presentes sem uma produção específica em mente.",
        ],
      },
      {
        heading: "Peças com presença",
        body: [
          "Quando a intenção é marcar uma data especial, acessórios com mais volume, banho dourado, formas geométricas ou composições em camadas podem criar um presente mais expressivo.",
          "Na loja física da Helena Joias em Araguaína, é possível comparar opções e montar uma escolha com mais personalidade.",
        ],
      },
      {
        heading: "Atendimento para escolher melhor",
        body: [
          "Se a dúvida for tamanho, estilo ou ocasião, o atendimento presencial e pelo WhatsApp ajuda a filtrar as opções. Isso é especialmente útil para presentes de Dia das Mães, Dia dos Namorados, formaturas, aniversários e celebrações familiares.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostUrl(slug: string) {
  return `${siteUrl}/blog/${slug}`;
}

export function getBlogJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    image: `${siteUrl}${post.image}`,
    url: getPostUrl(post.slug),
    mainEntityOfPage: getPostUrl(post.slug),
    author: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  };
}
