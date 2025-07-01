import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { redisClient } from './redis'

export const jobProcessing = async (req: Request, res: Response, next: NextFunction) => {
  const jobId = req.params.id

  const orders = await getOrdersFromRedis(jobId)

  if (!orders) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: 'Task not found',
    })
    return
  }

  if (orders.done) {
    await clearOrdersFromRedis(jobId)
  }

  res.status(StatusCodes.OK).json(orders)
}

const getOrdersFromRedis = async (jobId: string) => {
  const client = await redisClient()
  const orders = await client.get(jobId)

  return orders ? JSON.parse(orders) : null
}

const clearOrdersFromRedis = async (jobId: string) => {
  const client = await redisClient()
  const result = await client.del(jobId)
  return result
}
