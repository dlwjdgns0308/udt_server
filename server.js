const express = require("express");
const app = express();
const port = 3001; 
const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require("./db");
const path = require('path');
const fs = require('fs');
const multer = require('multer');

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// console.log(generateRandomString(6)); // 랜덤한 6자리 문자열 출력 예시: "5gh9LZ"


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
    const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category WHERE category=? ",[req.query.id]);

    const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value, creator, created_at FROM content WHERE category=? ",[req.query.id]);
    
    

    res.send({content:rows,title:rows2});
  });


const upload = multer({});
const date = new Date();
const datetime = date.toISOString().slice(0, 19).replace('T', ' ');

app.post('/1/edit_content', upload.array('images'), async (req, res) => {
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
    const sql = await DB.query("INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?, ?, ?) ",[req.query.id]);
    const values = [`${category}`, `http://43.201.68.150:3001/source/${filePath}`, filename, null,"0"];
    const [rows, fields] = await DB.query(sql, values);
    fs.writeFileSync(filePath, file.buffer);
  }
  const file = req.files[0];
  const filename = file.originalname;
  const Path = 'http://43.201.68.150:3001/source/'
  const filePath = `${Path}/${dir}/${filename}`;
  // DB에 데이터 삽입
  const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , 'pugn',datetime, '원', 0];
  const [rows, fields] = await DB.query(sql, values);

  console.log(rows);
  res.send('이미지 파일 업로드 완료');
});

app.post('/2/edit_content', (req,res) => {
  const category = req.body.category;
})
  
app.get("/2/edit_content", async (req, res) => {
  console.log(req.query.id);
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category WHERE category=? ",[req.query.id]);

  const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value, creator, created_at FROM content WHERE category=? ",[req.query.id]);
  
  

  res.send({content:rows,title:rows2});
});

app.get("/map", async (req, res) => {
    const [rows,fields] = await DB.query("SELECT  from_id,from_login,from_name,to_id,to_login,to_name,followed_at FROM t_relation");
    res.send(rows);
});

app.post("/name_search",async  (req, res) => {
    const user_name = req.body.name;
    const [rows,fields] = await  DB.query("SELECT name FROM youtube_user_list WHERE name LIKE ?",[user_name + "%"]);
    let arr2 = [];
    rows.forEach((element) => {
        arr2 = arr2.concat(element.name);
    });
    res.send(arr2);
});
app.listen(port, () => {
    console.log(`Connect at http://localhost:${port}`);
});



