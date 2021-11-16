const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail : getUserByEmail };