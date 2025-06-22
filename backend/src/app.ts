import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/account';

const app = express();
app.use(cors());
app.use('/api/account', accountRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
