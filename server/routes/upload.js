const express = require('express');
const multer  = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ message: 'Aucun fichier' });

  res.json({
    url: `/uploads/${f.filename}`,   // <— relative (on la préfixera au front)
    name: f.originalname || f.filename,
    mime: f.mimetype,
    size: f.size
  });
});

module.exports = router;
