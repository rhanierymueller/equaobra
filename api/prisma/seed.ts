import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hash = await bcrypt.hash('123456', 10)

  const professionals = [
    { name: 'Carlos Mendes', profession: 'Pedreiro', rating: 4.8, reviewCount: 47, phone: '47991234567', addrCity: 'Blumenau', addrNeighborhood: 'Velha', addrState: 'SC', addrLat: -26.9194, addrLng: -49.0661, tags: ['Fundação','Alvenaria','Acabamento'] },
    { name: 'João Ribeiro', profession: 'Eletricista', rating: 4.9, reviewCount: 62, phone: '47992345678', addrCity: 'Blumenau', addrNeighborhood: 'Garcia', addrState: 'SC', addrLat: -26.9008, addrLng: -49.0553, tags: ['Instalação Elétrica','Quadros','SPDA'] },
    { name: 'Paulo Ferreira', profession: 'Encanador', rating: 4.6, reviewCount: 33, phone: '47993456789', addrCity: 'Indaial', addrNeighborhood: 'Centro', addrState: 'SC', addrLat: -26.8981, addrLng: -49.2336, tags: ['Hidráulica','Gás','Aquecimento Solar'] },
    { name: 'Ricardo Oliveira', profession: 'Pintor', rating: 4.7, reviewCount: 55, phone: '47994567890', addrCity: 'Blumenau', addrNeighborhood: 'Itoupava Norte', addrState: 'SC', addrLat: -26.8712, addrLng: -49.0589, tags: ['Textura','Grafiato','Pintura Externa'] },
    { name: 'Marcos Souza', profession: 'Marceneiro', rating: 4.5, reviewCount: 28, phone: '47995678901', addrCity: 'Gaspar', addrNeighborhood: 'Centro', addrState: 'SC', addrLat: -26.9308, addrLng: -48.9591, tags: ['Móveis Planejados','Portas','Decks'] },
    { name: 'Antônio Lima', profession: 'Azulejista', rating: 4.8, reviewCount: 41, phone: '47996789012', addrCity: 'Blumenau', addrNeighborhood: 'Ponta Aguda', addrState: 'SC', addrLat: -26.9286, addrLng: -49.0679, tags: ['Porcelanato','Fachadas','Piscinas'] },
    { name: 'Roberto Alves', profession: 'Gesseiro', rating: 4.4, reviewCount: 19, phone: '47997890123', addrCity: 'Timbó', addrNeighborhood: 'Centro', addrState: 'SC', addrLat: -26.8244, addrLng: -49.2727, tags: ['Forro','Sancas','Molduras'] },
    { name: 'Fernando Costa', profession: 'Mestre de Obras', rating: 4.9, reviewCount: 73, phone: '47998901234', addrCity: 'Blumenau', addrNeighborhood: 'Água Verde', addrState: 'SC', addrLat: -26.9357, addrLng: -49.0786, tags: ['Gerenciamento','Reforma','Construção'] },
    { name: 'Lucas Pereira', profession: 'Pedreiro', rating: 4.3, reviewCount: 22, phone: '47999012345', addrCity: 'Pomerode', addrNeighborhood: 'Centro', addrState: 'SC', addrLat: -26.7427, addrLng: -49.1763, tags: ['Alvenaria','Reboco','Contrapiso'] },
    { name: 'Diego Nunes', profession: 'Eletricista', rating: 4.7, reviewCount: 38, phone: '47991123456', addrCity: 'Blumenau', addrNeighborhood: 'Jardim Blumenau', addrState: 'SC', addrLat: -26.9121, addrLng: -49.0832, tags: ['Automação','CFTV','Alarme'] },
    { name: 'Tiago Santos', profession: 'Pintor', rating: 4.6, reviewCount: 45, phone: '47992234567', addrCity: 'Gaspar', addrNeighborhood: 'Sete de Setembro', addrState: 'SC', addrLat: -26.9227, addrLng: -48.9642, tags: ['Pintura Interna','Verniz','Stencil'] },
    { name: 'André Machado', profession: 'Encanador', rating: 4.5, reviewCount: 31, phone: '47993345678', addrCity: 'Blumenau', addrNeighborhood: 'Victor Konder', addrState: 'SC', addrLat: -26.9174, addrLng: -49.0723, tags: ['Tubulação','Aquecimento','Bomba'] },
    { name: 'Gustavo Rocha', profession: 'Marceneiro', rating: 4.8, reviewCount: 52, phone: '47994456789', addrCity: 'Indaial', addrNeighborhood: 'Iridiva', addrState: 'SC', addrLat: -26.9051, addrLng: -49.2289, tags: ['Marcenaria Fina','Restauração','Armários'] },
    { name: 'Rafael Torres', profession: 'Azulejista', rating: 4.6, reviewCount: 36, phone: '47995567890', addrCity: 'Blumenau', addrNeighborhood: 'Fortaleza', addrState: 'SC', addrLat: -26.9412, addrLng: -49.0509, tags: ['Cerâmica','Mármore','Pedra Natural'] },
    { name: 'Bruno Cardoso', profession: 'Gesseiro', rating: 4.7, reviewCount: 27, phone: '47996678901', addrCity: 'Timbó', addrNeighborhood: 'Boa Vista', addrState: 'SC', addrLat: -26.8188, addrLng: -49.2654, tags: ['Gesso Acartonado','Drywall','Isolamento'] },
    { name: 'Eduardo Moreira', profession: 'Mestre de Obras', rating: 4.8, reviewCount: 61, phone: '47997789012', addrCity: 'Blumenau', addrNeighborhood: 'Badenfurt', addrState: 'SC', addrLat: -26.8891, addrLng: -49.1012, tags: ['Obras Comerciais','Reformas','Supervisão'] },
  ]

  for (const p of professionals) {
    const email = `${p.name.toLowerCase().replace(/ /g, '.')}.prof@equaobra.com`

    await prisma.user.upsert({
      where: { email },
      create: {
        name: p.name,
        email,
        passwordHash: hash,
        role: 'profissional',
        roles: JSON.stringify(['profissional']),
        profession: p.profession,
        professions: JSON.stringify([p.profession]),
        hourlyRate: Math.floor(Math.random() * 80 + 40),
        phone: p.phone,
        rating: p.rating,
        reviewCount: p.reviewCount,
        available: true,
        tags: JSON.stringify(p.tags),
        addrCity: p.addrCity,
        addrNeighborhood: p.addrNeighborhood,
        addrState: p.addrState,
        addrLat: p.addrLat,
        addrLng: p.addrLng,
        bio: `Profissional experiente em ${p.profession} com foco em qualidade e prazo.`,
      },
      update: {},
    } as Parameters<typeof prisma.user.upsert>[0])
  }

  await prisma.user.upsert({
    where: { email: 'contratante@equaobra.com' },
    create: {
      name: 'Ana Construtora',
      email: 'contratante@equaobra.com',
      passwordHash: hash,
      role: 'contratante',
      roles: JSON.stringify(['contratante']),
      companyName: 'ANA CONSTRUÇÕES LTDA',
      cnpj: '12.345.678/0001-90',
      addrCity: 'Blumenau',
      addrState: 'SC',
    },
    update: {},
  })

  console.log(`✅ ${professionals.length} profissionais + 1 contratante demo criados.`)
  console.log('   Login demo: contratante@equaobra.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
