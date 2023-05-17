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
  try{
    const category = req.body.category;
    const description = req.body.description;
    const title = req.body.title;
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
    "�옒紐� �겢由��븯�떊嫄곗짛? �떎�떆 �븳 踰� �룄�쟾�빐蹂댁꽭�슂!,�씠踰� �젅踰⑥�� 醫� 源뚮떎濡쒖썱�굹遊먯슂. �븯吏�留� �떎�쓬�뿉�뒗 �뜑 �옱諛뚮뒗 �룄�쟾�씠 以�鍮꾨릺�뼱 �엳�쓣 嫄곗뿉�슂.,�삤�뒛��� �슫�씠 蹂꾨줈 �뾾�뿀�굹遊먯슂. �떎�쓬�뿉�뒗 醫� �뜑 �슫�씠 醫뗪린瑜� 鍮뚯뼱�뱶�젮�슂!,珥덈낫�옄媛� �븘�땲�떆援곗슂! �뜑 �뼱�젮�슫 紐⑺몴瑜� �뼢�빐 �굹�븘媛�蹂댁꽭�슂.,�씠踰덉뿉�룄 硫뗭쭊 寃곌낵瑜� �씠猷⑥뀲�뒿�땲�떎. �븯吏�留� �씠�젣遺��꽣�뒗 �뜑 �겙 �룄�쟾�씠 湲곕떎由ш퀬 �엳�떟�땲�떎.,�씠誘� 寃쏀뿕�씠 留롮쑝�떊 遺꾩씠�떆�땲 �씠�젨 �뜑�슧 �뜑 ����떒�븳 寃곌낵瑜� �씠猷⑥뀛�룄 �맗�땲�떎. �슦由ш�� 湲곕���븷寃뚯슂!,�씠踰� �떎�뙣�뒗 �떎�쓬�뿉�뒗 瑗� �꽦怨듯븷 �옄�떊�쓣 �궎�썙以� 嫄곗뿉�슂. 議곌툑留� �뜑 �끂�젰�븯硫� �맗�땲�떎!,�닕�젴�옄湲됱씠�떆援곗슂. �씠�젨 �뜑 �뼱�젮�슫 �룄�쟾�룄 �쟾��� 臾댁꽠吏� �븡寃좎짛?,�씠誘� 理쒓퀬�뿉 �룄�떖�븯�뀲�뒿�땲�떎! �씠�젣�뒗 �뜑 �옄�쑀濡�寃� �룄�쟾�빐蹂댁꽭�슂. �떦�떊�쓽 �옱�뒫�쓣 蹂댁뿬二쇱꽭�슂!,�씠踰� 寃곌낵�뒗 �뿭���湲됱엯�땲�떎! �떦�떊�씠 �씠 寃뚯엫�쓽 �쟾�꽕�씠 �맆 嫄곗뿉�슂.";
    const level = "珥덈낫�옄,�븰�뒿�옄,�닔�젴�깮,�쟾臾멸��,踰좏뀒�옉,�뒪�럹�뀥由ъ뒪�듃,怨좎닔,留덉뒪�꽣,嫄곗옣,���媛�,�쟾�꽕";
    // DB�뿉 �뜲�씠�꽣 �궫�엯
    const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount,message,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , 'pugn',datetime, '�썝', 0,message, level];
    const [rows, fields] = await DB.query(sql, values);
  
    console.log(rows);
    res.send('�씠誘몄�� �뙆�씪 �뾽濡쒕뱶 �셿猷�');
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

    const category = req.body.category;
    // const name = req.body.name;
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
        // // �닔�젙荑쇰━ �꽔湲�
        
        const sql = 'UPDATE content SET name = ?, value = ? WHERE img_url = ?;';
        // const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
        // const values = [`${category}`, `http://43.201.68.150:3001/source/${category}/${filename}`, filename, null,"0"];
        // const [rows, fields] = await DB.query(sql, values);
        fs.writeFileSync(filePath, file.buffer);
      }
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const name = req.body.name[i];
      console.log(file)
      const filePath = `${dir}/${name}`;
      console.log(filePath)
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



