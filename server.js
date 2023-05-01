const express = require("express");
const app = express();
const port = 3001; // react�뜝�럩踰� �뼨轅명�∽옙沅싨뤆�룆占썬굩�삕�뜝占� 3000�뜝�럩逾졾뜝�럥鍮띸뭐癒뀁삕 3000�뜝�럩逾� �뜝�럥�닡�뜝�럥鍮� �뜝�럥�닡占쎈닱�뜝占� �뜝�럥�빢
const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require("./db");
const path = require('path');
const fs = require('fs');



app.get('/directory', (req, res) => {
    const directoryPath = __dirname; // 현재 파일의 경로를 가져옵니다.
    
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.log('Error:', err);
        return res.status(500).send('Internal server error');
      }
      
      res.send(files);
    });
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/list/main",async (req, res) => {
    const [rows,fields] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at FROM category");
    
    res.send(rows);
});

app.use(express.static('source'));
app.get("/content", async (req, res) => {
    console.log(req.query.id);
    const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value, creator, created_at FROM content WHERE category=? ",[req.query.id]);
    const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit FROM category WHERE category=? ",[req.query.id]);
    
    console.log(rows)
    res.send({content:rows,title:rows2});
  });
  
  const imagePath = '/game/1.png'; // �씠誘몄�� �뙆�씪�쓽 �젅��� 寃쎈줈


  
  
  app.get('/image', (req, res) => {
    res.sendFile("./source/game/1.png");
  });
  
app.get("/user/twitch", async (req, res) => {
    console.log(req.query.id);
    const [rows,fields] = await DB.query("SELECT  user_id, user_login,user_name,profile_image_url, view_count, created_at FROM twitch_user_list WHERE user_id = ? ORDER BY view_count DESC Limit 1",[req.query.id]);
    const [rows2,fields2] = await DB.query("SELECT  user_id,user_name,created_at,creator_id,creator_name,run_time,video_url,thumbnail,title,view_count,game_id FROM t_clips WHERE user_id = ? ORDER BY view_count DESC Limit 5",[req.query.id]);   
    const [rows3,fields3] = await DB.query("SELECT  user_id,user_login,user_name,title,created_at,url,thumbnail,view_count,run_time FROM t_videos WHERE user_id = ? ORDER BY created_at desc Limit 10",[req.query.id]);   
    
    console.log(rows);
    
    res.send({user:rows,clip:rows2,video:rows3});
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



