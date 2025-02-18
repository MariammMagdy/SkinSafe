const mongoose = require("mongoose");

const dbSkinSafe = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`Database Connection: ${conn.connection.host}`);
  });
};
module.exports = dbSkinSafe;
