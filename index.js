// Importing all Dependecies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fastcsv = require('fast-csv');
const fs = require('fs');
const ws = fs.createWriteStream("response.csv");
const ObjectsToCsv = require('objects-to-csv');
const mysql = require('mysql');
const session = require('express-session');
const multer = require('multer');
const zipFolder = require('zip-folder')
const app = express();
const port = 3000;

//Configuring the app setting

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
  secret: 'thisisasecret',
  saveUninitialized: false,
  resave: false
  })
  );
var sess;
// app.use(fileUpload({
//   useTempFiles : true,
//   tempFileDir : '/tmp/'
// }));
//Managing Routes for the App

app.get('/', (req,res) => {
  Talukas = ["Vadodara","Anand", "Chhota Udaipur","Dahod","Kheda","Mahisagar","Panchmahal","Ahmedabad","Gandhinagar","Aravalli","Banaskantha", "Mehsana",    "Patan",    "Sabarkantha",    "Rajkot",  "Amreli", "Bhavnagar",    "Botad",
    "Devbhoomi Dwarka",  "Gir Somnath",    "Jamnagar",    "Junagadh",    "Morbi", "Porbandar","Surendranagar",  "Kachchh", "Surat", "Bharuch", "Dang", "Narmada",  "Navsari",  "Tapi",
    "Valsad"]
    res.render('index', {talukas: Talukas});
});

const con = mysql.createConnection({
  host: 'localhost',
  user:'root',
  password:'',
  database:'Toefi'
});
con.connect();
app.post('/adddata', (req,res) => {
    console.log(Number(req.body.schooludise));
    const csvWriter = createCsvWriter({
        path: 'response.csv',
        header: [
            {id: 'school_udise', title: 'School Udise'},
            {id: 'school_name', title: 'School Name'},
            {id: 'school_district', title: 'District/Taluka'},
            {id: 'name', title: 'Name'},
            {id: 'designation', title: 'Designation'},
            {id: 'email', title: 'Email-Id'},
            {id: 'mobile_number', title: 'Mobile'},
        ]
    });
    const data = [
       { school_udise: req.body.schooludise,
        school_name: req.body.schoolname,
        district: req.body.district,
        taluka: req.body.taluka,
        name: req.body.name,
        designation: req.body.designation,
        email_id: req.body.email,
        mobile: req.body.number,
        agree: req.body.tnc  
      }
    ];
    sess = req.session;
    req.session.u_id = data[0].school_udise;
    sess.u_id = data[0].school_udise;
        console.log("Connected!");
        con.query("INSERT INTO toefi_registration SET ? ", data,(err, result)  => {
          if (err) throw err;
          console.log("Database created");
        });
      
      
    //csvWriter.writeRecords(data).then(() => console.log('Success!!'));
    // fastcsv.write(data, { headers: true }).pipe(ws);
   /* const csv = new ObjectsToCsv(data);
    csv.toDisk('./response.csv', {append: true})*/
    res.redirect('/guidelines')

})

app.get('/guidelines', (req,res) => {
    console.log(req.body.schooludise)
    res.render('guideline')
}) 

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+ file.originalname)
  }
})
var upload = multer({ storage: storage })
app.post('/submitguide', upload.any() , (req,res,next) =>{
  // console.log(req.body)
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log(req.session);
  const data = [
    {
      school_udise: req.session.u_id,
      Criteria_1: req.body.part1,
      Criteria_2: req.body.part2,
      Criteria_3: req.body.part3,
      Criteria_4: req.body.part4,
      Criteria_5: req.body.part5,
      Criteria_6: req.body.part6,
      Criteria_7: req.body.part7,
      Criteria_8: req.body.part8,
      Criteria_9: req.body.part9,
      }];
    const fileData = [
      {
      school_udise: req.session.u_id,
      Img_1: files[0]?  files[0].filename: "NULL",
      Img_2: files[1]?  files[1].filename: "NULL",
      Img_3: files[2]?  files[2].filename: "NULL",
      Img_4: files[3]?  files[3].filename: "NULL",
      Img_5: files[4]?  files[4].filename: "NULL",
      Img_6: files[5]?  files[5].filename: "NULL",
      Img_7: files[6]?  files[6].filename: "NULL",
      Img_8: files[7]?  files[7].filename: "NULL",
      Img_9: files[8]?  files[8].filename: "NULL",
      }
    ];
    console.log("Connected!");
    con.query("INSERT INTO toefi_requirement SET ? ", data,(err, result)  => {
      if (err) throw err;
      console.log("Database created");
    }); 
    con.query("INSERT INTO toefi_user_data SET ? ", fileData,(err, result)  => {
      if (err) throw err;
      console.log("Database created");
    });  
    res.send("<h1>Your Response has been succesfully send</h1>");
});    

app.get('/admin', (req,res) => {
  con.query("SELECT * FROM toefi_registration", (err,result) => {
    if (err) throw err;
    console.log(result[0]);
    const dataPacks = result;
    const csv = new ObjectsToCsv(dataPacks);
    csv.toDisk('public/response.csv')
  })
  con.query("SELECT * FROM toefi_requirement", (err,result) => {
    if (err) throw err;
    console.log(result[0]);
    const dataPacks = result;
    const csv = new ObjectsToCsv(dataPacks);
    csv.toDisk('public/user_response.csv')
  })

  con.query("SELECT * FROM toefi_user_data ", (err,result) => {
    if (err) throw err;
    console.log(result[0]);
    const dataPacks = result;
    const csv = new ObjectsToCsv(dataPacks);
    csv.toDisk('public/file_response.csv')
  })
  zipFolder('public/uploads', 'public/files.zip', function(err) {
    if(err) {
        console.log('oh no!', err);
    } else {
        console.log('EXCELLENT');
    }
});
  res.render('admin');

})
app.get('/terms', (req,res) => {
  res.render('terms');
})
//Starting Server At PortNumber 3000
app.listen(port, () => {})
