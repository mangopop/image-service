// GOAL image service
// take an image and save to resized versions of it
// TODO 
// maybe serve large image in different sizes? Would have to upload first, so would be saved anyway,
// but could repsonsd with more images sizes instead of saving them all


var express = require('express')
var app = express()
var multer = require('multer')

// var upload = multer({ dest: './uploads/'}) // doens't set nice name
var Jimp = require("jimp");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })

// var upload = multer({ storage: storage })

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })


app.set('view engine', 'pug');
app.set('views', './views');

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.get('/', function (req, res) {
  res.render('home')
})

//Take a size and return json base64 string for src
app.get('/imageUrl/:width', function (req, res) {
  // res.setHeader('Content-disposition', 'attachment; filename=' + attachment.Name);
  // res.setHeader('Content-type', 'image/jpeg');
  
  Jimp.read("./uploads/fin.jpg", function (err, image) {
    if (err) throw err;  
    console.log('width '+req.params.width)
    image.resize(parseInt(req.params.width), Jimp.AUTO)
      .quality(80)
      .getBuffer(image._originalMime, (err, buffer) => {
        //Transfer image file buffer to base64 string
        var base64Image = buffer.toString('base64');
        var imgSrcString = "data:" + image._originalMime + ';base64, ' + base64Image;
        //send into a src and show image
        res.json(imgSrcString)    
        // res.render('uploadedImage',{link:imgSrcString}) // send to a template     
      });
  })
  
});

//go to the upload form
app.get('/upload', function (req, res) {
  res.render('uploadForm')
})

// save small image and original to the image folder with suffix _large and _small
app.post('/photos/upload', upload.single('photo'), function (req, res, next) {
  // req.files is array of `photos` files
  // console.log(req.file)
  // req.body will contain the text fields, if there were any
  // console.log(req.body)

  // open a file
  Jimp.read(req.file.buffer, function (err, photo) {
    if (err) throw err;
    // console.log(photo)
    // photo.resize(Jimp.AUTO, 250)            // resize
    //   .quality(80)                 // set JPEG qualitycc
    //   .write("./uploads/" + photo.originalname + "-small.jpg"); // save
    photo.resize(Jimp.AUTO, 1000)            // resize
      .quality(90)                 // set JPEG qualitycc
      .write("./uploads/" + photo.originalname + "-large.jpg"); // save
  });

  res.status(204).end()
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
