const express = require("express");
const app = express();
const port = 80; 


const cors = require("cors");
const bodyParser = require("body-parser");
const DB = require("./db");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { error } = require("console");
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const { emitWarning } = require("process");
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});
// AWS 계정 자격 증명 설정

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/list/main",async (req, res) => {

  const selectBtn1 = req.body.selectedButton1;
  const selectBtn2 = req.body.selectedButton2;
  const search = req.body.search;
  let query = "SELECT  * FROM category";
const now = new Date();

 
  if (selectBtn2 == 'day') {
    query += " WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 DAY ) AND NOW()" // 일별로 데이터를 필터링 (지난 1일)
  } else if (selectBtn2 == 'week') {
    query += " WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 WEEK ) AND NOW()"  // 주별로 데이터를 필터링 (이번 주)
  } else if (selectBtn2 == 'month') {
    query += " WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 MONTH ) AND NOW()" ; // 월별로 데이터를 필터링 (이번 달)
  } else if (selectBtn2 == 'all'){
    query += " WHERE created_at BETWEEN DATE_ADD(NOW(), INTERVAL -1 YEAR ) AND NOW()"
  }
  if (search != ''){
    query += ` AND title LIKE '%${search}%'`
  }
  if(selectBtn1 == 'latest'){
    query += " ORDER BY created_at DESC"; // 최신순으로 데이터 정렬
  }else{
    query += " ORDER BY likecount DESC"; // 인기순으로 데이터 정렬
  }


 
  const [rows,fields] = await DB.query(query);
  res.header("Access-Control-Allow-Origin", "*");
  res.send(rows);
});

app.post("/search",async (req,res) => {
const query = req.body.title;
const [rows,fields] = await DB.query(`SELECT * FROM category WHERE title LIKE '%${query}%'`);
});
app.post("/lank",async (req, res) => {
  const category = req.body.id;

  let query = "SELECT  category, image, name, level,levelname, score, title  FROM lanking ";
  if(category != 'all'){
    query += `WHERE category = '${category}'`;
    
  }
  query += "ORDER BY score DESC";
  const [rows,fields] = await DB.query(query);

  let query2 = "SELECT  comment, name, created_at  FROM comment ";
  if(category != 'all'){
    query2 += `WHERE category = '${category}'`;
    
  }
  query2 += "ORDER BY created_at DESC";
  const [rows2,fields2] = await DB.query(query2);
  
  
  res.send({content:rows,comment:rows2});
});


app.post("/comment",async (req, res) => {
  if(req.body.session != null){
    const category = req.body.category;
    const user = req.body.session.user.email;
    const name = req.body.session.user.name;
    const comment = req.body.comment;
    const date = new Date();
    const datetime = date.toISOString().slice(0, 19).replace('T', ' ');
   
    const [rows,fields] = await DB.query( "INSERT INTO comment (category,user,name,comment,created_at) VALUES (?, ?, ?, ?, ?)",[category,user,name,comment,datetime]);
  
 
    res.status(200).send();
  }else{
    res.status(201).send();
  }


  
  
});


app.post("/delcomment",async (req, res) => {
  if(req.body.session != null){
    const category = req.body.category;
    const user = req.body.session.user.email;
    const comment = req.body.comment;
    const [rows, fields] = await DB.query("DELETE FROM comment WHERE category = ? AND comment = ? AND user = ?",[category,comment,user]);
 
    res.status(200).send();
  }else{
    res.status(201).send();
  }


  
  
});




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
  
  const deleteFolder = async (bucketName, folderPath) => {
    const listParams = {
      Bucket: bucketName,
      Prefix: folderPath
    };
  
    try {
      const data = await s3.listObjectsV2(listParams).promise();
      if (data.Contents.length === 0) {
        console.log('Folder is empty.');
        return;
      }
  
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: data.Contents.map(obj => ({ Key: obj.Key })),
          Quiet: false
        }
      };
  
      const deleteResult = await s3.deleteObjects(deleteParams).promise();
      console.log('Folder deleted successfully:', deleteResult);
    } catch (err) {
      console.log('Failed to delete folder:', err);
    }
  };
  
  // 사용 예시
  const bucketName = 'udtowns3'; // 버킷 이름
  const folderPath = `data/${category}/`; // 삭제할 폴더 경로 (마지막에 슬래시를 포함해야 함)

  deleteFolder(bucketName, folderPath);
  
  
  

  res.status(200).send();
});



app.post("/gameover",async (req, res) => {

  const name = req.body.session.name;
  const email = req.body.session.email;
  const level = req.body.progressBarLevel;
  const levelname = req.body.levelName;
  const score = req.body.score;
  const top = 0;
  const category = req.body.category;
  const image = req.body.session.image;
  if(email.length > 5){
    const [rows,fields] = await DB.query("SELECT  title FROM category WHERE category=? ",[category]);
    const title = rows[0].title;
    
    const [rows2,fields2] = await DB.query("SELECT  score FROM lanking WHERE email=? AND category=? ",[email,category]);
    if(rows2.length > 1){
      top = rows2[0].score;
    }
    if(score > top){
      // 기존 랭킹 제거
      const [rows2, fields2] = await DB.query("DELETE FROM lanking WHERE category = ? AND email=? ",[category,email]);
      // 랭킹 정보 추가
      const [rows, fields] = await DB.query("INSERT INTO lanking (name, level, levelname, score, category, image, email, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ", [name, level, levelname, score, category, image, email, title]);

    
    }
 
  }

  res.status(200).send();
});

app.use('/source', express.static('/home/ubuntu/source'))



app.get("/content", async (req, res) => {
   
    const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[req.query.id]);

    const [rows, fields] = await DB.query("SELECT category, img_url, name,author, value FROM content WHERE category=? ",[req.query.id]);
    
    
    res.header("Access-Control-Allow-Origin", "*");
    res.send({content:rows,title:rows2});
  });




const creator = undefined;
let likecount = undefined;

app.post("/1/edit_content/start", async (req, res) => {

  const user = req.body.session.user.email;
  const category = req.body.category;
  
  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[category]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name, author, value FROM content WHERE category=?", [category]);
 
  res.header("Access-Control-Allow-Origin", "*");
  if (rows2.length == 0){
   
  }else{
    creator = rows2[0].creator;
  }
 
  if( creator == undefined){
    //占쎄퉱嚥≪뮇�뒲 ��뚢뫂��쀯㎘占�
    res.status(200).send();
  }else if( creator == user){
    //疫꿸퀣��덌옙���占쏙옙占�
    res.status(201).send({content:rows,title:rows2});
  }else{
    //占쎈뼄�몴紐꾩��占쏙옙占�

    res.status(300).send();
  }
 
});


app.post("/content/start", async (req, res) => {

  const user = req.body.session.user.email;
  const category = req.body.category;
  const uca =  user + category; 
  const [rows, fields] = await DB.query("SELECT user, category, uca FROM likecount WHERE uca=?", [uca]);

 
 
  if (rows.length == 0){
    likecount = undefined;
  }else{

    likecount = rows[0].user;
  }

  if( likecount == undefined){
    //좋아요 안눌림
    res.status(200).send();
  }else if( likecount == user){
    //좋아요 눌려있음
    res.status(201).send();
  }else{
    //

    res.status(300).send();
  }
 
});

app.post('/api/like', async (req, res) => {
  try {
    const category = req.body.category.category;
    const user = req.body.category.user; //  클라이언트에서 전송한 데이터 (게시물 ID 등)
    const uca =  user + category; 
    const liked = req.body.category.like;
  
    if(liked == false){
     // 좋아요 정보 추가
      const [rows, fields] = await DB.query("INSERT INTO likecount (user, category, uca) VALUES (?, ?, ?) ", [user,category,uca]);
       // 좋아요 수 증가
      const [rows2, fields2] = await DB.query("SELECT likecount FROM category WHERE category=?", [category]);
      const like = rows2[0].likecount + 1;
  
      const [rows3, fields3]  = await DB.query('UPDATE category SET likecount= ? WHERE category = ?',[like,category]);
     
      // 성공적으로 처리되었을 때 응답
      res.status(200).json();
    }else if(liked == true){
       // 좋아요 정보 삭제
       const [rows, fields] = await DB.query("DELETE FROM likecount WHERE uca = ? ", [uca]);
      // 좋아요 수 증가
      const [rows2, fields2] = await DB.query("SELECT likecount FROM category WHERE category=?", [category]);
      const like = rows2[0].likecount - 1;
      const [rows3, fields3]  = await DB.query('UPDATE category SET likecount= ? WHERE category = ?',[like,category]);
      res.status(201).json();
    }
   
  } catch (error) {
    // 에러 처리
    console.error('Failed to process like request', error);
    res.status(500).json({ success: false, error: 'Failed to process like request' });
  }
});


const uploads = multer({});

const upimg = multer({});
app.post('/2/edit_image', upimg.single('imaged'), async (req, res) => {
  try{

    const category = req.body.category;
    const filename = req.body.filename
    const params = {
      Bucket: 'udtowns3',
      Key: `data/${category}/${filename}`, // 폴더 이름을 포함한 객체 키
      Body: req.file.buffer, // 폴더를 만들기 위해 빈 본문 사용
    };
   
    await s3.upload(params).promise();
  }catch(error){

  }
});

app.post('/2/add_image', upimg.single('imaged'), async (req, res) => {
  try{
    console.log(req.body)
    const category = req.body.category;
    const filename = req.body.filename
    const params = {
      Bucket: 'udtowns3',
      Key: `data/${category}/${filename}`, // 폴더 이름을 포함한 객체 키
      Body: req.file.buffer, // 폴더를 만들기 위해 빈 본문 사용
    };
    const imageUrl = `https://udtowns3.s3.ap-northeast-2.amazonaws.com/data/${category}/${filename}`;
    await s3.upload(params).promise();

    const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
    const values = [`${category}`, imageUrl, filename, null,"0"];
    const [rows, fields] = await DB.query(sql, values);
  }catch(error){

  }
});
app.post('/1/edit_content', uploads.array('images'), async (req, res) => {
  try {
    const category = req.body.category;
    const description = req.body.description;
    const title = req.body.title;
    const user = req.body.user;
    const folderName = `data/${category}/`;
    
    const params = {
      Bucket: 'udtowns3',
      Key: folderName, // 폴더 이름을 포함한 객체 키
      Body: '', // 폴더를 만들기 위해 빈 본문 사용
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('폴더 만들기 실패');
      } else {
        console.log('폴더가 성공적으로 만들어졌습니다.');

        // 폴더안에 이미지 파일 저장하기
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const filename = Buffer.from(file.originalname, 'latin1').toString('utf8')
          
          const uploadParams = {
            Bucket: 'udtowns3',
            Key: folderName + filename,
            Body: file.buffer,
          };
          const imageUrl = data.Location + filename;
          try {
            await s3.upload(uploadParams).promise();
              // MySQL에 이미지 URL 저장
            const sql = "INSERT INTO content (category, img_url, name,author, value) VALUES (?, ?, ?, ?, ?) ";
            const values = [`${category}`, imageUrl, filename, null,"0"];
            const [rows, fields] = await DB.query(sql, values);
          
          } catch (error) {
            
          }
        }

        res.status(200).send('파일 업로드가 완료되었습니다.');
      }
    });

    const file = req.files[0];
    const filename = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const date = new Date();
    const datetime = date.toISOString().slice(0, 19).replace('T', ' ');
    const filePath = `https://udtowns3.s3.ap-northeast-2.amazonaws.com/data/${category}/${filename}`;
    const message = 
    "잘못 클릭하신거죠? 다시 한 번 도전해보세요!,이번 레벨은 좀 까다로웠나봐요. 하지만 다음에는 더 재밌는 도전이 준비되어 있을 거에요.,오늘은 운이 별로 없었나봐요. 다음에는 좀 더 운이 좋기를 빌어드려요!,초보자가 아니시군요! 더 어려운 목표를 향해 나아가보세요.,이번에도 멋진 결과를 이루셨습니다. 하지만 이제부터는 더 큰 도전이 기다리고 있답니다.,이미 경험이 많으신 분이시니 이젠 더욱 더 대단한 결과를 이루셔도 됩니다. 우리가 기대할게요!,이번 실패는 다음에는 꼭 성공할 자신을 키워줄 거에요. 조금만 더 노력하면 됩니다!,숙련자급이시군요. 이젠 더 어려운 도전도 전혀 무섭지 않겠죠?,이미 최고에 도달하셨습니다! 이제는 더 자유롭게 도전해보세요. 당신의 재능을 보여주세요!,이번 결과는 역대급입니다! 당신이 이 게임의 전설이 될 거에요.";
    const level = "초보자,학습자,수련생,전문가,베테랑,스페셜리스트,고수,마스터,거장,대가,전설";
    // DB에 저장하기
    const sql = "INSERT INTO category (link, description, category, name, title, img_url, creator, created_at, unit, likecount,message,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [`./content/${category}`, description, category,  file.originalname, title, filePath , user,datetime, '원', 0,message, level];
    const [rows, fields] = await DB.query(sql, values);

   
 
   }catch(error){

   }
 
});

  
app.get("/2/edit_content", async (req, res) => {

  const [rows2,fields2] = await DB.query("SELECT  link,description,category,name,title,img_url,creator,created_at,unit,likecount,message,level FROM category WHERE category=? ",[req.query.id]);
  const [rows, fields] = await DB.query("SELECT category, img_url, name, author, value FROM content WHERE category=?", [req.query.id]);
  
  res.send({content:rows,title:rows2});
});



const upload = multer({ });
app.post('/2/cancel_content',  async (req, res) => {
  const img = req.body.category.item.img_url
  const name = req.body.category.item.name;
  const category = req.body.category.category;
 
  const [rows, fields] = await DB.query("DELETE FROM content WHERE img_url = ? ",[img]);
  const deleteParams = {
    Bucket: 'udtowns3',
    Key: `data/${category}/${name}`
  };
  
  try {
    s3.deleteObject(deleteParams, (err, data) => {
      if (err) {
 
      } else {
        
      }});
  } catch (err) {
    console.log('Failed to delete file:', err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
  res.status(200);
});


app.post('/2/edit_content', upload.array('image'), async (req, res) => {
  try {

    const category = req.body.category;
    
    const datas = JSON.parse(req.body.data);
    const message = req.body.message; 
    const level = req.body.level; 
    const unit = req.body.unit; 
    const sql2 = 'UPDATE category SET message = ?, level = ?, unit= ?, name = ? WHERE category = ?;';
    const values2 = [message,level,unit,datas[0].name,category];
    const [rows2, fields2] = await DB.query(sql2, values2);
    datas.forEach(async data => {
      // console.log(data);
      const sql = 'UPDATE content SET name = ?, value = ? , author = ? WHERE img_url = ?;';
      const values = [data.name,data.value,data.author,data.img_url];
      const [rows, fields] = await DB.query(sql, values);
    });
    
    
    const dir = `/home/ubuntu/source/${category}`;

   
    res.status(200).send({ messege :'sucess' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to upload image.' });
  }
});


app.listen(port, () => {
    console.log(`Connect at http://localhost:${port}`);
});



