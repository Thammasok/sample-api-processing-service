import { NextFunction, Request, Response } from 'express'
import { Status } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import { PrismaClient } from './generated/prisma'
import { v4 as uuidv4 } from 'uuid'
import { redisClient } from './redis'

export const orderUpdates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getOrders()

    if (!orders) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get orders',
      })
      return
    }

    const count = orders.length
    if (count > 0) {
      const jobId = uuidv4()

      const initialTask = {
        total: count,
        completed: 0,
        failed: 0,
        done: false,
      }

      const saved = await updateProcessToRedis(jobId, initialTask)

      if (!saved) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to save task to redis',
        })
        return
      }

      // update orders status to processing
      updateProcessing(orders, jobId, initialTask)

      res.status(StatusCodes.OK).json({
        jobId,
        count,
      })
    }
  } catch (error) {
    console.error('Error processing orders:', error)
  }
}

const updateProcessing = async (
  orders: { id: number }[],
  jobId: string,
  taskData: { total: number; completed: number; failed: number },
) => {
  const start: number = 0
  const batchSize: number = 10

  try {
    for (let i = start; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize)

      try {
        const done = await updateOrdersStatus(batch)

        taskData.completed += done
        taskData.failed += batch.length - done

        await updateProcessToRedis(jobId, taskData)
        console.log(`Updated ${done}/${batch.length} orders`)
      } catch (error) {
        taskData.failed += batch.length
        await updateProcessToRedis(jobId, taskData)
        console.error(`Failed to update batch:`, error)
      }

      // sleep 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    await updateProcessToRedis(jobId, {
      ...taskData,
      done: true,
    })

    console.log('All orders processed')
  } catch (error) {
    console.error('Error in updateProcessing:', error)
    throw error
  }
}

const getOrders = async () => {
  const prisma = new PrismaClient()

  const orders = await prisma.order.findMany({
    where: {
      status: Status.PENDING,
    },
    select: {
      id: true,
      status: true,
      createdAt: false,
      updatedAt: false,
    },
  })

  return orders
}

const updateOrdersStatus = async (orders: { id: number }[]) => {
  const prisma = new PrismaClient()

  const transaction = await prisma.$transaction(
    orders.map((order) => {
      return prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: Status.COMPLETED,
        },
      })
    }),
  )

  return transaction.length
}

const updateProcessToRedis = async (jobId: string, data: object, done?: string) => {
  const client = await redisClient()
  const result = await client.set(jobId, JSON.stringify(data))
  return result
}
