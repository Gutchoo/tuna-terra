#!/usr/bin/env node

/**
 * Script to create test users using Supabase Admin API
 * This ensures passwords are properly hashed
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    id: '00000000-0000-4000-a000-000000000001',
    email: 'test1@example.com',
    password: 'tunaterra123',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User 1',
      full_name: 'Test User 1'
    }
  },
  {
    id: '00000000-0000-4000-a000-000000000002',
    email: 'test2@example.com',
    password: 'tunaterra123',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User 2',
      full_name: 'Test User 2'
    }
  },
  {
    id: '00000000-0000-4000-a000-000000000003',
    email: 'test3@example.com',
    password: 'tunaterra123',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User 3',
      full_name: 'Test User 3'
    }
  }
]

async function createTestUsers() {
  console.log('Creating test users...\n')

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata
    })

    if (error) {
      console.error(`  ❌ Error creating ${user.email}:`, error.message)
    } else {
      console.log(`  ✓ Created ${user.email} (ID: ${data.user.id})`)
    }
  }

  console.log('\n✓ Test user creation complete!')
  console.log('\nTest credentials:')
  console.log('  Email: test1@example.com | Password: tunaterra123')
  console.log('  Email: test2@example.com | Password: tunaterra123')
  console.log('  Email: test3@example.com | Password: tunaterra123')
}

createTestUsers().catch(console.error)
