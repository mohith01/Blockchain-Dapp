var express = require('express');
var mongoose = require('mongoose');
var app = express();
var multer = require('multer');
var path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static('src'));

app.use(express.static('../BookChain-Contract/build/contracts'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + 'signup.html');
});
app.listen(3000, function () {
  console.log('App connected on port 3000!');
});

const uri = "mongodb+srv://ashwinkumar:4NJnQkvArWfiBgmp@cluster0.rg99wei.mongodb.net/BookChain";

async function connect() {
  try{
    await mongoose.connect(uri).then(() => console.log('Connected to MongoDB!'));
  }
  catch (error) {
    console.log(error);
  }
}

connect();

var upload = multer ({
  storage: multer.diskStorage ({
    destination: (req, file, cb)=>{
      cb(null, './src/uploads');
    },
    filename : function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
})

const userschema = new mongoose.Schema({
  username: String,
  email: String,
  metamask: String,
  nft: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const User = mongoose.model('User', userschema, 'UserDetails');

const bookschema = new mongoose.Schema({
  title: String,
  author: String,
  bookid: Number,
  pages: String,
  edition: Number,
  release: Number,
  genre: String,
  image: String,
  format: String,
  special: String,
  description: String,
  marketprice: Number,
  userprice: Number,
  metamask: String,
  upforsale: Boolean
});

const Book = mongoose.model('Book', bookschema, 'BookDetails');

app.post("/signup", async function(req, res) {
  try{
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      metamask: req.body.metamask,
      nft: []
    });

    const result = await User.findOneAndUpdate(
      {metamask: user.metamask}, {$set: user}, {upsert: true, new: true}
    );
    console.log('User saved to database :', result);
    console.log('Inserted User ID :', result._id.toString());

    const userdbid = result._id.toString();
    const resdata = { success: true, message : 'Sending userid', userdbid: userdbid };
    console.log(resdata);
    res.status(200).json(resdata);
  }
  catch(error) {
     console.error('Could not save user to database !', error);
  }

})

app.post("/newimage", upload.single("photo"), (req, res) => {
  const { filename, mimetype, path: filePath } = req.file;
  const targetPath = path.join(__dirname, 'uploads', filename + '.png');
  res_file_name = filename;
  res.send(res_file_name);
})

app.post("/newbook", async function(req, res) {
  try{
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      bookid: req.body.bookid,
      pages: req.body.pages,
      edition: req.body.edition,
      release: req.body.release,
      genre: req.body.genre,
      image: req.body.image,
      format: req.body.format,
      special: req.body.special,
      description: req.body.description,
      marketprice: 0,
      userprice: 0,
      metamask: req.body.metamask,
      upforsale: false 
    });

    // Book value
    let price = 0;

    // Edition
    let edition = 0;

    switch(book.edition) {
      case 1: edition = 20; break;
      case 2: edition = 30; break;
      case 3: edition = 40; break;
      default : edition = 10; break; 
    }
    console.log("Edition : "+edition);

    // Release
    let release = 0;
    let range = 2023 - book.release;

    switch(true) {
      case (range <=3 ): release = 10; break;
      case (range >3 && range <= 7 ): release = 20; break;
      case (range >7 ): release = 30; break;
    }
    console.log("Range : "+range);
    console.log("Release : "+release);

    // Genre
    let genre = 0;

    switch(book.genre) {
      case 'Autobiography' : genre = 30; break;
      case 'Adventure' : genre = 40; break;
      case 'Biography' : genre = 30; break;
      case 'Comedy' : genre = 50; break;
      case 'Fantasy' : genre = 50; break;
      case 'Fiction' : genre = 40; break;
      case 'Thriller' : genre = 50; break;
      case 'Inspiration' : genre = 30; break;
      default : genre = 20; break;
    }
    console.log("Genre : "+genre);

    // Format
    let format = 0;

    switch(book.format) {
      case 'Paperback' : format = 50; break;
      case 'Hardcover' : format = 40; break;
      case 'E-Book' : format = 30; break;
      default : format = 20; break;
    }
    console.log("Format : "+format);

    // Special
    let special = 0;

    switch(book.special) {
      case 'Yes' : special = 50; break;
    }
    console.log("Special : "+special);

    price = edition + release + genre + format + special;
    book.marketprice = price;

    console.log("Book Price : "+book.marketprice);

    const result = await Book.findOneAndUpdate(
      {bookid: book.bookid}, {$set: book}, {upsert: true, new: true}
    );
    console.log('Book saved to database:', result);
    console.log('Inserted Book ID:', result._id.toString());

    try{
      let user = await User.findOneAndUpdate({ metamask : req.body.metamask }, { $push: { nft: result._id} }, { new: true });
      console.log(user);
    }
    catch(err) {
      console.error(err);
    }

    const bookdbid = result._id.toString();
    const resdata = { success: true, message : 'Sending bookid', bookdbid: bookdbid };
    console.log(resdata);
    res.status(200).json(resdata);
  }
  catch(error) {
    console.error('Could not save book to database !', error)
  };

})

app.post("/buybook", async function(req, res) {
  try{
    let book = await Book.findOne({ bookid: req.body.bookid })

    // Update owner for nft
    let newbook = await Book.findOneAndUpdate({ bookid: req.body.bookid }, { $set: { metamask: req.body.buyer, upforsale: false, marketprice: book.userprice }}, {new: true})
    console.log("Book Nft Updated !");
    console.log(newbook);

    // Remove nft from owner
    let removeduser = await User.findOneAndUpdate({ nft: book._id }, { $pull: { nft: book._id }}, { new: true })
    console.log("Removed from Owner !");
    console.log(removeduser);

    // Insert nft to buyer
    let addeduser =  await User.findOneAndUpdate({ metamask: req.body.buyer }, { $push: { nft: book._id }}, { new: true })
    console.log("Added to New Owner !");
    console.log(addeduser);

    const owner = book.metamask;
    const price = book.userprice;
    const resdata = {message : 'Sending book owner address', owner: owner, price: price };
    res.status(200).json(resdata);
  }
  catch{
    
  }
})

app.post("/inventory", async function(req, res) {
  try{
    let NFTcontents = await Book.find({ metamask: req.body.metamaskId });

    const results = [];

    for await (const item of NFTcontents) {
      results.push(item);
    }
    console.log(results);
    return res.status(200).send(results);
  }
  catch(error){
    console.log(error);
    res.status(400).json({ error: error.toString() });
  }
});

app.post("/bookdata", async function(req, res) {
  try{
    let Bookcontents = await Book.find({ bookid: req.body.bookid });

    const results = [];

    for await (const item of Bookcontents) {
      results.push(item);
    }
    console.log(results);
    return res.status(200).send(results);
  }
  catch(error){
    console.log(error);
    res.status(400).json({ error: error.toString() });
  }
});

app.post("/sellbook", async function(req, res) {
  try{
    let book = await Book.updateOne({ bookid: req.body.bookid }, { $set: { upforsale: true, userprice: req.body.userprice }}, {new: true});
    res.status(200).json(book);
  }
  catch(error){
    console.log(error);
    res.status(400).json({ error: error.toString() });
  }
});

app.post("/storebooks", async function(req, res) {
  try{
    let NFTcontents = await Book.find({ upforsale: req.body.upforsale});

    const books = [];

    for await (const book of NFTcontents) {
      books.push(book);
    }
    console.log(books);
    return res.status(200).send(books);
  }
  catch(error){
    console.log(error);
    res.status(400).json({ error: error.toString() });
  }
});





