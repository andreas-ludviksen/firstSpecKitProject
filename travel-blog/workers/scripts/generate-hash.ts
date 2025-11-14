/**
 * Script to generate bcrypt password hashes for user credentials
 * Usage: npx ts-node scripts/generate-hash.ts [password]
 * If no password provided, will prompt for input
 */

import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const COST_FACTOR = 10;

async function main() {
  let password = process.argv[2];

  // If no password provided as argument, prompt for it
  if (!password) {
    password = await promptPassword();
  }

  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  console.log(`\nHashing password with cost factor ${COST_FACTOR}...`);
  const hash = bcrypt.hashSync(password, COST_FACTOR);

  console.log('\n✅ Bcrypt hash (cost factor 10):');
  console.log(hash);
  console.log('\nCopy this hash to use in SQL INSERT statement');
  console.log('⚠️  Never commit plaintext passwords or hashes to git!\n');
}

function promptPassword(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter password to hash: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
