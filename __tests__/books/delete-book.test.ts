import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { beforeAll, expect, describe, it } from 'vitest'

const dynamodb = new DynamoDB({})
const TableName = 'test-db'

describe('delete-book', () => {
  beforeAll(async () => {
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
  })

  describe('SUCCESS', () => {
    it('deletes a book', async () => {
      await dynamodb.send(
        new DeleteCommand({
          TableName,
          Key: {
            pk: 'USER#3',
            sk: 'BOOK#3',
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

      expect(book).toBeUndefined()
    })
  })

  describe('ERROR', () => {
    it('throws an error when the requested book cannot be found', async () => {
      async function deleteBook() {
        await dynamodb.send(
          new DeleteCommand({
            TableName,
            ConditionExpression:
              'attribute_exists(pk) AND attribute_exists(sk)',
            Key: {
              pk: 'USER#2',
              sk: 'BOOK#1',
            },
          })
        )
      }

      expect(() => deleteBook()).rejects.toThrowError(
        'The conditional request failed'
      )
    })
  })
})
