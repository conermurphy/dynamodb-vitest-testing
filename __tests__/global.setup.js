import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDB,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb'

const dynamodb = new DynamoDB({})
const TableName = 'test-db'

async function pollTablesList(tableName) {
  const tables = await dynamodb.send(new ListTablesCommand())

  if (tables.TableNames.includes(tableName)) {
    await pollTablesList(tableName)
  }
}

async function pollTable(status) {
  const table = await dynamodb.send(
    new DescribeTableCommand({
      TableName,
    })
  )

  if (table.Table.TableStatus !== status) {
    await pollTable(status)
  }
}

export async function setup() {
  console.log('Running Setup')
  try {
    await dynamodb.send(
      new CreateTableCommand({
        TableName,
        AttributeDefinitions: [
          {
            AttributeName: 'pk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'sk',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'pk',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'sk',
            KeyType: 'RANGE',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
    )

    await pollTable('ACTIVE')
  } catch (e) {
    console.log(e)
  }
}

export async function teardown() {
  console.log('Running Teardown')
  await dynamodb.send(
    new DeleteTableCommand({
      TableName,
    })
  )

  await pollTablesList(TableName)
}
