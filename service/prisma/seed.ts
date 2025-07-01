import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const orderMock = []

  for (let i = 0; i < 100; i++) {
    orderMock.push({
      status: 'PENDING',
    })
  }

  const orders = await prisma.order.createMany({
    data: orderMock,
  })

  console.log(`updated ${orders.count} orders`)
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
