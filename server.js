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


  function uploadImages(app, upload, category) {
    // 이미지 파일 업로드 요청 처리
    app.post('/edit_content', upload.array('images'), (req, res) => {
      console.log(req); // 업로드된 파일 정보 출력
      res.send('이미지 파일 업로드 완료');
    });
  
    // 업로드된 파일이 저장될 디렉토리 생성
    const dir = `/home/ubuntu/source/${category}`;
    fs.mkdir(dir, { recursive: true, mode: 0o755 }, (err) => {
      if (err) throw err;
      console.log(`${dir} directory created!`);
    });
  
    // 업로드된 파일이 저장될 디렉토리 설정
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, dir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });
  
    // 파일 업로드 처리를 위한 multer 미들웨어 생성
    const upload = multer({ storage: storage });
  }
  
  // 카테고리에 대한 이미지 파일 업로드 요청 처리
  app.post('/edit_content/:category', (req, res) => {
    const category = req.params.category;
    const upload = multer({ dest: `/home/ubuntu/source/${category}` });
    uploadImages(app, upload, category);
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



