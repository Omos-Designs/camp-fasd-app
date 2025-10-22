const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function runMigration() {
  // Extract connection details from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\nDropping existing constraint...');
    await client.query(`
      ALTER TABLE application_questions DROP CONSTRAINT IF EXISTS application_questions_question_type_check;
    `);
    console.log('✅ Existing constraint dropped');

    console.log('\nAdding new constraint with medication_list, allergy_list, and table...');
    await client.query(`
      ALTER TABLE application_questions
      ADD CONSTRAINT application_questions_question_type_check
      CHECK (question_type IN (
        'text',
        'textarea',
        'dropdown',
        'multiple_choice',
        'checkbox',
        'file_upload',
        'profile_picture',
        'medication_list',
        'allergy_list',
        'table',
        'date',
        'email',
        'phone',
        'signature'
      ));
    `);
    console.log('✅ New constraint added successfully');

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now save medication_list, allergy_list, and table questions.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

runMigration();
