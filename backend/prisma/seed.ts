import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonte: src/data/communities.ts (replicado aqui para seed)
const COMMUNITIES: Array<{
  slug: string;
  nome: string;
  descricao: string;
  membros: number;
  tags: string[];
  capa?: string;
}> = [
  {
    slug: 'roteiros-historicos',
    nome: 'Roteiros Históricos',
    descricao: 'Troca de planos de aula e visitas guiadas em cidades históricas brasileiras.',
    membros: 842,
    tags: ['História', 'Patrimônio', 'MG', 'RJ'],
    capa: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'ciencias-da-natureza',
    nome: 'Ciências da Natureza',
    descricao: 'Experimentos de campo, biodiversidade e parques para aulas ao ar livre.',
    membros: 1210,
    tags: ['Biologia', 'Geografia', 'Amazônia', 'Parques'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'arte-e-cultura',
    nome: 'Arte & Cultura',
    descricao: 'Roteiros com museus, centros culturais e práticas integradas em artes.',
    membros: 975,
    tags: ['Arte', 'Museus', 'Teatro', 'Oficinas'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'acessibilidade-e-inclusao',
    nome: 'Acessibilidade e Inclusão',
    descricao: 'Boas práticas para viagens inclusivas, mediadas e com materiais acessíveis.',
    membros: 503,
    tags: ['Acessibilidade', 'Educação Inclusiva', 'Guias'],
    capa: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'tecnologia-educacional',
    nome: 'Tecnologia Educacional',
    descricao: 'Exploração de museus interativos, laboratórios maker e experiências imersivas.',
    membros: 1325,
    tags: ['Tecnologia', 'Maker', 'STEAM', 'Robótica'],
    capa: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'educacao-infantil-em-movimento',
    nome: 'Educação Infantil em Movimento',
    descricao: 'Passeios lúdicos e atividades sensoriais para crianças pequenas em viagem.',
    membros: 688,
    tags: ['Educação Infantil', 'Ludicidade', 'Famílias'],
    capa: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'turismo-de-campo',
    nome: 'Turismo de Campo',
    descricao: 'Itinerários em fazendas pedagógicas, zonas rurais e experiências agroecológicas.',
    membros: 931,
    tags: ['Campo', 'Agroecologia', 'Sustentabilidade'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'linguas-e-intercambio',
    nome: 'Línguas e Intercâmbio',
    descricao: 'Troca de roteiros bilíngues, intercâmbios culturais e parcerias internacionais.',
    membros: 774,
    tags: ['Idiomas', 'Intercâmbio', 'Cultura Global'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'matematica-em-movimento',
    nome: 'Matemática em Movimento',
    descricao: 'Passeios que estimulam lógica, jogos matemáticos e desafios em espaços urbanos.',
    membros: 612,
    tags: ['Matemática', 'Jogos', 'Raciocínio'],
    capa: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'educacao-financeira',
    nome: 'Educação Financeira',
    descricao: 'Roteiros para trabalhar consumo consciente, empreendedorismo e projetos escolares.',
    membros: 458,
    tags: ['Finanças', 'Empreendedorismo', 'Projetos'],
  },
  {
    slug: 'projetos-sustentaveis',
    nome: 'Projetos Sustentáveis',
    descricao: 'Experiências em parques, reservas e iniciativas de impacto socioambiental.',
    membros: 1104,
    tags: ['Sustentabilidade', 'ODS', 'Clima', 'Tecnologia Verde'],
    capa: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'esportes-educativos',
    nome: 'Esportes Educativos',
    descricao: 'Integração de práticas esportivas, valores coletivos e cultura corporal em viagens.',
    membros: 542,
    tags: ['Esporte', 'Corpo', 'Bem-estar'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'cultura-afro-brasileira',
    nome: 'Cultura Afro-brasileira',
    descricao: 'Percursos de valorização da memória afro-brasileira, quilombos e patrimônios vivos.',
    membros: 873,
    tags: ['História', 'Identidade', 'Cultura Popular'],
    capa: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'literatura-em-viagem',
    nome: 'Literatura em Viagem',
    descricao: 'Roteiros literários, saraus e clubes de leitura itinerantes para estudantes.',
    membros: 497,
    tags: ['Literatura', 'Leitura', 'Criatividade'],
    capa: 'https://images.unsplash.com/photo-1455884981818-54cb785db6fc?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'ciencias-humanas-integradas',
    nome: 'Ciências Humanas Integradas',
    descricao: 'Integra História, Geografia e Sociologia em viagens investigativas.',
    membros: 989,
    tags: ['Humanas', 'Pesquisa', 'Cidadania'],
    capa: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'laboratorios-criativos',
    nome: 'Laboratórios Criativos',
    descricao: 'Desafios de design thinking, prototipagem rápida e arte digital em trânsito.',
    membros: 655,
    tags: ['Criatividade', 'Design Thinking', 'Arte Digital'],
    capa: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=900&q=80',
  },
];

async function main() {
  for (const c of COMMUNITIES) {
    await prisma.community.upsert({
      where: { slug: c.slug },
      update: {
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags.join(','),
        capa: c.capa ?? null,
      },
      create: {
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao,
        membros: c.membros,
        tags: c.tags.join(','),
        capa: c.capa ?? null,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
