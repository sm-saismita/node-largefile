const path = require('path');
const multer = require('multer');
// require()
const uploadFilePath = path.join(__dirname,'../uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,uploadFilePath);
    },
    filename: (req, file, cb) => {
        // let ext = path.extname(file.originalname);
        cb(null, file.originalname);
      }
})

const uploadImage = multer({ 
    storage: storage
});

module.exports = {
    uploadImage
}