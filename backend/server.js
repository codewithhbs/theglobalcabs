require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`✅ API running on port ${PORT} [${process.env.NODE_ENV}]`)
  );
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION 💥', err.name, err.message);
    server.close(() => process.exit(1));
  });
});
