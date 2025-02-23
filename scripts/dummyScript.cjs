require('dotenv').config()
const PocketBase = require('pocketbase/cjs')

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

async function main() {
  try {
    const users = await pb.collection('users').getFullList()

    console.log('users', users)

    // update email visibility
    for (const user of users) {
      await pb.collection('users').update(user.id, {
        emailVisibility: true,
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
