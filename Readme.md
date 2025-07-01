# Sample APIs Processing Service

this is a sample api processing service for large scale data processing

## Getting Started

1. start docker container

```bash
docker-compose up -d
```

or you can start specific container (postgres, redis, etc)

```bash
docker-compose up -d <container_name>
```

2. install dependencies

```bash
npm install
```

3. Generate Database Schema

```bash
npm run prisma:mig:dev
```

or you can use prisma generate

```bash
npm run prisma:gen
```

4. start the app

```bash
npm run dev
```

so far the app is running on port 3000

```text
http://localhost:3000
```

## APIs

you can try the following APIs. It's have 2 steps.

1. create a job (or task)

```text
GET http://localhost:3000/orders/updates
```

you will receive a job id.

```json
{
  "jobId": "572fc2b8-93ae-435e-968c-30a4edc88bbe",
  "count": 100
}
```

2. get processing result

get job id from step 1 `572fc2b8-93ae-435e-968c-30a4edc88bbe`

```text
GET http://localhost:3000/orders/updates/:id
```

example

```text
GET http://localhost:3000/orders/updates/72fc2b8-93ae-435e-968c-30a4edc88bbe
```

waiting done.
