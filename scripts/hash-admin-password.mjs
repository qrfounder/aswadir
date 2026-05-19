#!/usr/bin/env node
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs 'your-password'");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("ADMIN_PASSWORD_HASH=" + hash);
