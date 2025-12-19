import { diskStorage } from 'multer';
import { extname } from 'path';

// Compteur global pour suivre la position des images uploadées
let fileIndex = 0;

export const multerConfig = {
  storage: diskStorage({
    destination: './src/Images', // toutes les images vont ici
    filename: (req, file, callback) => {
      // Récupérer l'email depuis le body
      const email = req.body.email || 'unknown';
      // Extension originale
      const ext = extname(file.originalname);
      // Nom final : email+index+extension
      const filename = `${email}-${fileIndex}${ext}`;
      fileIndex++;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Seules les images sont autorisées !'), false);
    }
    callback(null, true);
  },
};
