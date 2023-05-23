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
  res.status(200).send('?„±ê³µì ?œ¼ë¡? ?°?´?„°ë¥? ?‚­? œ?•˜????Šµ?‹ˆ?‹¤');
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
    //?ƒˆë¡œìš´ ì»¨í…ì¸?
    res.status(200).send();
  }else if( creator == user){
    //ê¸°ì¡´?œ ???
    res.status(201).send({content:rows,title:rows2});
  }else{
    //?‹¤ë¥¸ìœ ???
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
    
    // ï¿½ë¤ƒï¿½ëœ‘åª›ï¿½ è­°ëŒ?˜±ï¿½ë¸¯ï§ï¿½ ï¿½ë¸¡ï¿½ì‘ï§ï¿½ ï¿½ë¤ƒï¿½ëœ‘ ï¿½ê¹®ï¿½ê½¦
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    
    // ï¿½ë™†ï¿½ì”ª ï¿½ï¿½ï¿½ï¿½?˜£
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
    "?˜ëª? ?´ë¦??•˜?‹ ê±°ì£ ? ?‹¤?‹œ ?•œ ë²? ?„? „?•´ë³´ì„¸?š”!,?´ë²? ? ˆë²¨ì?? ì¢? ê¹Œë‹¤ë¡œì› ?‚˜ë´ìš”. ?•˜ì§?ë§? ?‹¤?Œ?—?Š” ?” ?¬ë°ŒëŠ” ?„? „?´ ì¤?ë¹„ë˜?–´ ?ˆ?„ ê±°ì—?š”.,?˜¤?Š˜??? ?š´?´ ë³„ë¡œ ?—†?—ˆ?‚˜ë´ìš”. ?‹¤?Œ?—?Š” ì¢? ?” ?š´?´ ì¢‹ê¸°ë¥? ë¹Œì–´?“œ? ¤?š”!,ì´ˆë³´?ê°? ?•„?‹ˆ?‹œêµ°ìš”! ?” ?–´? ¤?š´ ëª©í‘œë¥? ?–¥?•´ ?‚˜?•„ê°?ë³´ì„¸?š”.,?´ë²ˆì—?„ ë©‹ì§„ ê²°ê³¼ë¥? ?´ë£¨ì…¨?Šµ?‹ˆ?‹¤. ?•˜ì§?ë§? ?´? œë¶??„°?Š” ?” ?° ?„? „?´ ê¸°ë‹¤ë¦¬ê³  ?ˆ?‹µ?‹ˆ?‹¤.,?´ë¯? ê²½í—˜?´ ë§ìœ¼?‹  ë¶„ì´?‹œ?‹ˆ ?´?   ?”?š± ?” ????‹¨?•œ ê²°ê³¼ë¥? ?´ë£¨ì…”?„ ?©?‹ˆ?‹¤. ?š°ë¦¬ê?? ê¸°ë???• ê²Œìš”!,?´ë²? ?‹¤?Œ¨?Š” ?‹¤?Œ?—?Š” ê¼? ?„±ê³µí•  ??‹ ?„ ?‚¤?›Œì¤? ê±°ì—?š”. ì¡°ê¸ˆë§? ?” ?…¸? ¥?•˜ë©? ?©?‹ˆ?‹¤!,?ˆ™? ¨?ê¸‰ì´?‹œêµ°ìš”. ?´?   ?” ?–´? ¤?š´ ?„? „?„ ? „??? ë¬´ì„­ì§? ?•Šê² ì£ ?,?´ë¯? ìµœê³ ?— ?„?‹¬?•˜?…¨?Šµ?‹ˆ?‹¤! ?´? œ?Š” ?” ??œ ë¡?ê²? ?„? „?•´ë³´ì„¸?š”. ?‹¹?‹ ?˜ ?¬?Š¥?„ ë³´ì—¬ì£¼ì„¸?š”!,?´ë²? ê²°ê³¼?Š” ?—­???ê¸‰ì…?‹ˆ?‹¤! ?‹¹?‹ ?´ ?´ ê²Œì„?˜ ? „?„¤?´ ?  ê±°ì—?š”.";
    const level = "ì´ˆë³´?,?•™?Šµ?,?ˆ˜? ¨?ƒ,? „ë¬¸ê??,ë² í…Œ?‘,?Š¤?˜?…œë¦¬ìŠ¤?Š¸,ê³ ìˆ˜,ë§ˆìŠ¤?„°,ê±°ì¥,???ê°?,? „?„¤";
    // DBï¿½ë¿‰ ï¿½ëœ²ï¿½ì” ï¿½ê½£ ï¿½ê¶«ï¿½ì—¯
    const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount,message,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '?›', 0,message, level];
    const [rows, fields] = await DB.query(sql, values);

    console.log(rows);
    res.send('?„±ê³?');
  }catch(error){
    res.status(405).send(error);
  }
 
  const category = req.body.category;
  const description = req.body.description;
  const title = req.body.title;
  const user = req.body.user;
  const dir = `/home/ubuntu/source/${category}`;
  console.log(dir,category)
  
  // ï¿½ë¤ƒï¿½ëœ‘åª›ï¿½ è­°ëŒ?˜±ï¿½ë¸¯ï§ï¿½ ï¿½ë¸¡ï¿½ì‘ï§ï¿½ ï¿½ë¤ƒï¿½ëœ‘ ï¿½ê¹®ï¿½ê½¦
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // ï¿½ë™†ï¿½ì”ª ï¿½ï¿½ï¿½ï¿½?˜£
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
  // DBï¿½ë¿‰ ï¿½ëœ²ï¿½ì” ï¿½ê½£ ï¿½ê¶«ï¿½ì—¯
  const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '?›', 0];
  const [rows, fields] = await DB.query(sql, values);

  console.log(rows);
  res.send('ì²˜ë¦¬?˜?—ˆ?Šµ?‹ˆ?‹¤');
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
      // // ï¿½ë‹”ï¿½ì ™?‘?‡°?” ï¿½ê½”æ¹²ï¿½
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



