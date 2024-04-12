import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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

describe('update-book', () => {
  beforeAll(async () => {
    await dynamodb.send(
      new PutCommand({
        TableName,
        Item: {
          pk: 'USER#2',
          sk: 'BOOK#2',
          author: 'Example Author',
          title: 'Example Title',
        },
      })
    )
  })

  describe('SUCCESS', () => {
    it('updates a book', async () => {
      const { Attributes: book } = await dynamodb.send(
        new UpdateCommand({
          TableName,
          Key: {
            pk: 'USER#2',
            sk: 'BOOK#2',
          },
          UpdateExpression: 'set author = :a',
          ExpressionAttributeValues: {
            ':a': 'Author 2',
          },
          ReturnValues: 'ALL_NEW',
        })
      )

      const parsedBook = bookSchema.parse(book)

      expect(parsedBook).toMatchObject({
        pk: 'USER#2',
        sk: 'BOOK#2',
        author: 'Author 2',
        title: 'Example Title',
      })
    })
  })
})
