import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));

// Create folder if it doesn't exist
const photoDir = path.join(__dirname, 'your-photo-strip');
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir);
}

app.post('/save-photo', (req, res) => {
  const { imageData, filename } = req.body;
  const filePath = path.join(photoDir, filename);
  
  // Remove the data URL prefix and convert to buffer
  const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
  fs.writeFileSync(filePath, base64Data, 'base64');
  
  res.json({ success: true, path: filePath });
});

app.listen(3001, () => console.log('Server running on port 3001'));