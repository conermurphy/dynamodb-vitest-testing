import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { beforeAll, expect, describe, it } from 'vitest'
import { z } from 'zod'

const bookSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  author: z.string(),
  title: z.string(),
})

const dynamodb = new DynamoDB({})
const TableName = 'test-db'

describe('create-book', () => {
  beforeAll(async () => {})

  describe('SUCCESS', () => {
    it('updates a book', async () => {
      await dynamodb.send(
        new PutCommand({
          TableName,
          Item: {
            pk: 'USER#3',
            sk: 'BOOK#3',
            author: 'Example Author',
            title: 'Example Title',
          },
        })
      )

      const { Item: book } = await dynamodb.send(
        new GetCommand({
          TableName,
          Key: {
            pk: 'USER#3',
            sk: 'BOOK#3',
          },
        })
      )

      const parsedBook = bookSchema.parse(book)

      expect(parsedBook).toMatchObject({
        pk: 'USER#3',
        sk: 'BOOK#3',
        author: 'Example Author',
        title: 'Example Title',
      })
    })
  })
})
