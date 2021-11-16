
const getUserByEmail = (email, database) => {
  console.log(`GUBE_users-obj:`, database);
  console.log(`pre-forloopEmail:`, email);
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail : getUserByEmail };