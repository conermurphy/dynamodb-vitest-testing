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
  // Fetch a list of the current tables in the database
  const tables = await dynamodb.send(new ListTablesCommand())

  // If the current tables includes our table name, keep checking
  if (tables.TableNames.includes(tableName)) {
    await pollTablesList(tableName)
  }
}

async function pollTable(status) {
  // Fetch the current table from the database
  const table = await dynamodb.send(
    new DescribeTableCommand({
      TableName,
    })
  )

  // If the current status is not the provided status ("ACTIVE") then check again
  if (table.Table.TableStatus !== status) {
    await pollTable(status)
  }
}

export async function setup() {
  console.log('Running Setup')
  try {
    // When setting up the tests, create a new table on our docker database
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

    // Poll the table status to ensure it's ACTIVE before allowing tests to run
    await pollTable('ACTIVE')
  } catch (e) {
    console.log(e)
  }
}

export async function teardown() {
  console.log('Running Teardown')

  // Delete the table we created in the setup function
  await dynamodb.send(
    new DeleteTableCommand({
      TableName,
    })
  )

  // Poll the table to ensure it's been deleted before exitting
  await pollTablesList(TableName)
}
