const express = require("express");
const app = express();
const port = 3001; 
const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require("./db");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { error } = require("console");


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


app.post("/1/edit_content/start", async (req, res) => {
  console.log(req.body)
  const user = req.body.session.user.email;
  const category = req.body.category;
  
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[category]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name, author, value FROM content WHERE category=?", [category]);
  if(rows2.creator == undefined){
    //새로운 컨텐츠
    res.status(200).send();
  }else if(rows2.creator == user){
    //기존유저
    res.status(300).send({content:rows,title:rows2});
  }else{
    //다른유저
    res.status(123).send('다른 유저의 접근입니다.');
  }
 
});


app.post('/1/edit_content', uploads.array('images'), async (req, res) => {
  try{
    const category = req.body.category;
    const description = req.body.description;
    const title = req.body.title;
    const user = req.body.user;
    console.log(user);
    const dir = `/home/ubuntu/source/${category}`;
    console.log(dir,category)
    
    // �뤃�뜑媛� 議댁옱�븯吏� �븡�쑝硫� �뤃�뜑 �깮�꽦
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    
    // �뙆�씪 ����옣
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
    const message = 
    "잘못 클릭하신거죠? 다시 한 번 도전해보세요!,이번 레벨은 좀 까다로웠나봐요. 하지만 다음에는 더 재밌는 도전이 준비되어 있을 거에요.,오늘은 운이 별로 없었나봐요. 다음에는 좀 더 운이 좋기를 빌어드려요!,초보자가 아니시군요! 더 어려운 목표를 향해 나아가보세요.,이번에도 멋진 결과를 이루셨습니다. 하지만 이제부터는 더 큰 도전이 기다리고 있답니다.,이미 경험이 많으신 분이시니 이젠 더욱 더 대단한 결과를 이루셔도 됩니다. 우리가 기대할게요!,이번 실패는 다음에는 꼭 성공할 자신을 키워줄 거에요. 조금만 더 노력하면 됩니다!,숙련자급이시군요. 이젠 더 어려운 도전도 전혀 무섭지 않겠죠?,이미 최고에 도달하셨습니다! 이제는 더 자유롭게 도전해보세요. 당신의 재능을 보여주세요!,이번 결과는 역대급입니다! 당신이 이 게임의 전설이 될 거에요.";
    const level = "초보자,학습자,수련생,전문가,베테랑,스페셜리스트,고수,마스터,거장,대가,전설";
    // DB�뿉 �뜲�씠�꽣 �궫�엯
    const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount,message,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '원', 0,message, level];
    const [rows, fields] = await DB.query(sql, values);
  
    console.log(rows);
    res.send('성공');
  }catch(error){
    res.status(405).send(error);
  }
 
  const category = req.body.category;
  const description = req.body.description;
  const title = req.body.title;
  const user = req.body.user;
  const dir = `/home/ubuntu/source/${category}`;
  console.log(dir,category)
  
  // �뤃�뜑媛� 議댁옱�븯吏� �븡�쑝硫� �뤃�뜑 �깮�꽦
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // �뙆�씪 ����옣
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
  // DB�뿉 �뜲�씠�꽣 �궫�엯
  const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '�썝', 0];
  const [rows, fields] = await DB.query(sql, values);

  console.log(rows);
  res.send('�씠誘몄�� �뙆�씪 �뾽濡쒕뱶 �셿猷�');
});

  
app.get("/2/edit_content", async (req, res) => {
  console.log(req.query.id);
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[req.query.id]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name, author, value FROM content WHERE category=?", [req.query.id]);
  res.send({content:rows,title:rows2});
});



const upload = multer({ });
app.post('/2/cancel_content',  async (req, res) => {
  const img = req.body.img_url;
  const [rows, fields] = await DB.query("DELETE FROM content WHERE img_url = ? ",[img]);
  res.send('Data received');
});


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
    // console.log(req.body);
    console.log(req)

 
    // const name = req.body.name;
    // const filePath = `${dir}/${name}`;
    // console.log(filePath)
    // fs.writeFileSync(filePath, req.file.buffer);

    for (let i = 0; i < req.files.length; i++) {
      // const file = req.files[i];
      // const name = req.body.name[i];
      // const filePath = `${dir}/${name}`;
      // // �닔�젙荑쇰━ �꽔湲�
      const sql = 'UPDATE content SET name = ?, age = ? WHERE id = ?;';
      // const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
      // const values = [`${category}`, `http://43.201.68.150:3001/source/${category}/${filename}`, filename, null,"0"];
      // const [rows, fields] = await DB.query(sql, values);
      // fs.writeFileSync(filePath, file.buffer);
    }
   
    res.status(200).send({ messege :'sucess' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to upload image.' });
  }
});


app.listen(port, () => {
    console.log(`Connect at http://localhost:${port}`);
});



