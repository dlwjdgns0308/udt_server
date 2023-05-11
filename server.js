const express = require("express");
const app = express();
const port = 3001; 
const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require("./db");
const path = require('path');
const fs = require('fs');
const multer = require('multer');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/list/main",async (req, res) => {
    const [rows,fields] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category");
    
    res.send(rows);
});

app.use('/source', express.static('/home/ubuntu/source'))

app.get("/content", async (req, res) => {
    console.log(req.query.id);
    const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[req.query.id]);

    const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value FROM content WHERE category=? ",[req.query.id]);
    
    

    res.send({content:rows,title:rows2});
  });


const uploads = multer({});
const date = new Date();
const datetime = date.toISOString().slice(0, 19).replace('T', ' ');

app.post('/1/edit_content', uploads.array('images'), async (req, res) => {
  const category = req.body.category;
  const description = req.body.description;
  const title = req.body.title;
  const dir = `/home/ubuntu/source/${category}`;
  console.log(dir,category)
  
  // 폴더가 존재하지 않으면 폴더 생성
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // 파일 저장
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const filename = file.originalname;
    const filePath = `${dir}/${filename}`;
    const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
    const values = [`${category}`, `http://43.201.68.150:3001/source/${category}/${filename}`, filename, null,"0"];
    const [rows, fields] = await DB.query(sql, values);
    fs.writeFileSync(filePath, file.buffer);
  }
  const file = req.files[0];
  const filename = file.originalname;
  const Path2 = 'http://43.201.68.150:3001/source/'
  const filePath = `${Path2}/${category}/${filename}`;
  // DB에 데이터 삽입
  const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , 'pugn',datetime, '원', 0];
  const [rows, fields] = await DB.query(sql, values);

  console.log(rows);
  res.send('이미지 파일 업로드 완료');
});

  
app.get("/2/edit_content", async (req, res) => {
  console.log(req.query.id);
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[req.query.id]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value FROM content WHERE category=? ",[req.query.id]);
  
  
  

  res.send({content:rows,title:rows2});
});

app.post("/2/cancel_content", (req, res) => {
  try{
     console.log(req.body);
     res.status(200).send({ error: 'success' });
    }
    catch(error){
      res.status(500).send({ error: 'Failed to upload image.' });
    }
});
const upload = multer({ });
app.post('/2/edit_content', upload.array('image'), async (req, res) => {
  try {
    const category = req.body.category;
    const datas = JSON.parse(req.body.data);
    const message = req.body.message; 
    const level = req.body.level; 
    const unit = req.body.unit; 
    const sql2 = 'UPDATE category SET message = ?, level = ?, unit= ? WHERE category = ?;';
    const values2 = [message,level,unit,category];
    const [rows2, fields2] = await DB.query(sql2, values2);
    datas.forEach(async data => {
      // console.log(data);
      const sql = 'UPDATE content SET name = ?, value = ? , author = ? WHERE img_url = ?;';
      const values = [data.name,data.value,data.author,data.img_url];
      const [rows, fields] = await DB.query(sql, values);
    });
    
    
    const dir = `/home/ubuntu/source/${category}`;
    // const filePath = `${dir}/${name}`;
    // console.log(filePath)
    // fs.writeFileSync(filePath, req.file.buffer);

    if(req.files.length == 1){
      const file = req.files[0];
      console.log(req.body.data[0].name);
      const name = req.body.filename;
      const filePath = `${dir}/${name}`;
      fs.writeFileSync(filePath, file.buffer);
    }else{
      for (let i = 0; i < req.files.length; i++) {
        console.log(req.body.data[i].name);
        const file = req.files[i];
        console.log(file)
        const name = req.body.filename[i];
        console.log(name)
        const filePath = `${dir}/${name}`;
        console.log(filePath)
        // // 수정쿼리 넣기
        
        const sql = 'UPDATE content SET name = ?, value = ? WHERE img_url = ?;';
        // const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
        // const values = [`${category}`, `http://43.201.68.150:3001/source/${category}/${filename}`, filename, null,"0"];
        // const [rows, fields] = await DB.query(sql, values);
        fs.writeFileSync(filePath, file.buffer);
      }
    }
   
    res.status(200).send({ messege :'sucess' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to upload image.' });
  }
});


app.listen(port, () => {
    console.log(`Connect at http://localhost:${port}`);
});



