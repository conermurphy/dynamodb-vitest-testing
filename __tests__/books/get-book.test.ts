import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
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

describe('get-book', () => {
  beforeAll(async () => {
    await dynamodb.send(
      new PutCommand({
        TableName,
        Item: {
          pk: 'USER#1',
          sk: 'BOOK#1',
          author: 'Example Author',
          title: 'Example Title',
        },
      })
    )
  })

  describe('SUCCESS', () => {
    it('gets a book', async () => {
      const { Item: book } = await dynamodb.send(
        new GetCommand({
          TableName,
          Key: {
            pk: 'USER#1',
            sk: 'BOOK#1',
          },
        })
      )

      const parsedBook = bookSchema.parse(book)

      expect(parsedBook).toMatchObject({
        pk: 'USER#1',
        sk: 'BOOK#1',
        author: 'Example Author',
        title: 'Example Title',
      })
    })
  })
})
