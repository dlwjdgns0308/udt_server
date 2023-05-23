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
    console.log(req.body)
    const [rows,fields] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category");
    
    res.send(rows);
});

// app.get("/list/main", async (req, res) => {
//   console.log(req.query.id);
//   const [rows,fields] = await DB.query("SELECT  user_id, user_login,user_name,profile_image_url, view_count, created_at FROM twitch_user_list WHERE user_id = ? ORDER BY view_count DESC Limit 1",[req.query.id]);
//   const [rows2,fields2] = await DB.query("SELECT  user_id,user_name,created_at,creator_id,creator_name,run_time,video_url,thumbnail,title,view_count,game_id FROM t_clips WHERE user_id = ? ORDER BY view_count DESC Limit 5",[req.query.id]);   
//   const [rows3,fields3] = await DB.query("SELECT  user_id,user_login,user_name,title,created_at,url,thumbnail,view_count,run_time FROM t_videos WHERE user_id = ? ORDER BY created_at desc Limit 10",[req.query.id]);   
  
//   console.log(rows);
  
//   res.send({user:rows,clip:rows2,video:rows3});
// });


app.post("/list/mypage",async (req, res) => {
  const user = req.body.session.user.email;
  const [rows,fields] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category WHERE creator = ?",[user]);
  
  res.send(rows);
});

app.post("/list/mypagedel",async (req, res) => {
  const category = req.body.category;
  // const [rows,fields] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount FROM category WHERE creator = ?",[user]);
  const [rows, fields] = await DB.query("DELETE FROM content WHERE category = ? ",[category]);
  const [rows2, fields2] = await DB.query("DELETE FROM category WHERE category = ? ",[category]);
  const dir = `/home/ubuntu/source/${category}`;

  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
  }
  res.status(200).send('?��공적?���? ?��?��?���? ?��?��?��????��?��?��');
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
const creater = undefined;

app.post("/1/edit_content/start", async (req, res) => {
  console.log(req.body)
  const user = req.body.session.user.email;
  const category = req.body.category;
  
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[category]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name, author, value FROM content WHERE category=?", [category]);
 
 
  if (rows2.length == 0){
    creator = undefined
  }else{
    creator = rows2[0].creator;
  }
  console.log(user, category,  creator)
  if( creator == undefined){
    //?��로운 컨텐�?
    res.status(200).send();
  }else if( creator == user){
    //기존?��???
    res.status(201).send({content:rows,title:rows2});
  }else{
    //?��른유???
    console.log("fsfsdfdsfds")
    res.status(300).send();
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
    
    // �뤃�뜑媛� 議댁?���븯吏� �븡�쑝硫� �뤃�뜑 �깮�꽦
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    
    // �뙆�씪 ����?��
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
    "?���? ?���??��?��거죠? ?��?�� ?�� �? ?��?��?��보세?��!,?���? ?��벨�?? �? 까다로웠?��봐요. ?���?�? ?��?��?��?�� ?�� ?��밌는 ?��?��?�� �?비되?�� ?��?�� 거에?��.,?��?��??? ?��?�� 별로 ?��?��?��봐요. ?��?��?��?�� �? ?�� ?��?�� 좋기�? 빌어?��?��?��!,초보?���? ?��?��?��군요! ?�� ?��?��?�� 목표�? ?��?�� ?��?���?보세?��.,?��번에?�� 멋진 결과�? ?��루셨?��?��?��. ?���?�? ?��?���??��?�� ?�� ?�� ?��?��?�� 기다리고 ?��?��?��?��.,?���? 경험?�� 많으?�� 분이?��?�� ?��?�� ?��?�� ?�� ????��?�� 결과�? ?��루셔?�� ?��?��?��. ?��리�?? 기�???��게요!,?���? ?��?��?�� ?��?��?��?�� �? ?��공할 ?��?��?�� ?��?���? 거에?��. 조금�? ?�� ?��?��?���? ?��?��?��!,?��?��?��급이?��군요. ?��?�� ?�� ?��?��?�� ?��?��?�� ?��??? 무섭�? ?��겠죠?,?���? 최고?�� ?��?��?��?��?��?��?��! ?��?��?�� ?�� ?��?���?�? ?��?��?��보세?��. ?��?��?�� ?��?��?�� 보여주세?��!,?���? 결과?�� ?��???급입?��?��! ?��?��?�� ?�� 게임?�� ?��?��?�� ?�� 거에?��.";
    const level = "초보?��,?��?��?��,?��?��?��,?��문�??,베테?��,?��?��?��리스?��,고수,마스?��,거장,???�?,?��?��";
    // DB�뿉 �뜲�씠�꽣 �궫�엯
    const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount,message,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '?��', 0,message, level];
    const [rows, fields] = await DB.query(sql, values);

    console.log(rows);
    res.send('?���?');
  }catch(error){
    res.status(405).send(error);
  }
 
  const category = req.body.category;
  const description = req.body.description;
  const title = req.body.title;
  const user = req.body.user;
  const dir = `/home/ubuntu/source/${category}`;
  console.log(dir,category)
  
  // �뤃�뜑媛� 議댁?���븯吏� �븡�쑝硫� �뤃�뜑 �깮�꽦
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // �뙆�씪 ����?��
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
  const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '?��', 0];
  const [rows, fields] = await DB.query(sql, values);

  console.log(rows);
  res.send('처리?��?��?��?��?��');
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
      // // �닔�젙?��?��?�� �꽔湲�
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



