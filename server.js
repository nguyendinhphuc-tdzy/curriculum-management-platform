import app from './api/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Curriculum Management Server is running locally at http://localhost:${PORT}`);
});
