import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const balloons = [
    {
      serialNumber: "UM-180-456",
      registration: "EC-MBA",
      manufacturer: "Ultramagic",
      model: "N-180",
      operator: "Vuelos de Segovia",
      status: "Active",
    },
    {
      serialNumber: "KB-BB30-789",
      registration: "CS-BCK",
      manufacturer: "Kubicek",
      model: "BB30Z",
      operator: "Sky Balloons",
      status: "Active",
    },
    {
      serialNumber: "CAM-Z105-111",
      registration: "EC-MPY",
      manufacturer: "Cameron",
      model: "Z-105",
      operator: "Balloon Consulting",
      status: "Active",
    }
  ]

  for (const b of balloons) {
    await prisma.balloon.upsert({
      where: { serialNumber: b.serialNumber },
      update: b,
      create: b,
    })
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
