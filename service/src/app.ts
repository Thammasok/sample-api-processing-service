import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import { orderUpdates } from './order-update'
import { jobProcessing } from './job-process'

const app: Express = express()
app.use(cors())

const port: number = 3000

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello World!!',
  })
})

app.get('/orders/updates', orderUpdates)
app.get('/orders/updates/:id', jobProcessing)

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Not Found',
  })
})

app.listen(port, () => console.log(`Application is running on port ${port}`))
