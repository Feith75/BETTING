const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./betting.db');

db.run("UPDATE users SET subscription_tier = 'Premium' WHERE id = 1;", (err) => {
  if (err) {
    console.error('Error updating user:', err);
  } else {
    console.log('User subscription updated to Premium');
  }
  db.close();
});
