//Create Read Update Delete
//유저에게 db를 제어할 수 있는 인터페이스(모델,서비스)
//유저가 직접 db에 접속해서 데이터를 조작하면 안되나요? 안됩니다.
//1.데이터 조작의 인터페이스를 제한할 수 없다. (보안)
//2.불필요한 정보가 많아서 유저가 어려워서 이용하지 않는다 (서비스)
//3.유저가 sql 을 배워야한다. (어려움)
//4.....

//create,alter,drop :
// table 을 생성하거나 구주를 바꾸거나 삭제하는 명령어 (DDL)
//update,delete,insert(DML),select(DQL) :
// table 에 데이터를 추가하거나 삭제 또는 수정 조회 명령어
//es6 부터는 var 사용을 권장하지 않는다. (변수 지역 전역 구분이 있어야하는데.. var 무조건 전역)
const http=require("http");
const url=require("url");
const querystring=require("querystring");
const fs=require("fs/promises");
const mysql=require("mysql2");
const pug=require("pug");

const server=http.createServer();
server.listen(8888,()=>{
    console.log("http://localhost:8888 SCOTT CRUD 를 저공하는 서버")
});
const mysqlConInfo={
    host : "localhost",
    port : 3306,
    user : "root",
    password : "mysql123",
    database : "scott"
}
const createPool=mysql.createPool(mysqlConInfo); //접속을 계속 유지
const pool=createPool.promise();
server.on("request",async (req, res)=>{
    const urlObj=url.parse(req.url);
    const params=querystring.parse(urlObj.query);
    const urlSplits=urlObj.pathname.split("/");
    if (urlSplits[1]==="public"){//정적 리소스
        if(urlSplits[2]==="js"){
            res.setHeader("content-type","application/javascript");
        }else if(urlSplits[2]==="css"){
            res.setHeader("content-type","text/css");
        }else if(urlSplits[2]==="image"){
            res.setHeader("content-type","image/jpeg");
        }
        try {
            //fs : 서버가 실행되고 있는 컴퓨터를 기준으로 파일을 검색
            //"상대경로 /" : 컴퓨터의 root(c://) 경로를 기준으로 파일을 검색
            //"상대경로 . or ./" : 서버가 실행되고 있는 위치를 기준으로 파일을 검색
            let data=await fs.readFile("."+urlObj.pathname);
            res.write(data);
            res.end();
        }catch (e) {
            res.statusCode=404;
            res.end();
        }
    }else{
        if(urlObj.pathname==="/"){
            let html=pug.renderFile("./templates/index.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empList.do"){ //10분까지 쉬었다가 오겠습니다.
            try {
                const [rows,f]=await pool.query("SELECT * FROM EMP");
                let html=pug.renderFile("./templates/empList.pug",{empList:rows});
                res.write(html);
                res.end();
            }catch (e) {
                console.error(e);
            }
        }else if(urlObj.pathname==="/empDetail.do"){
            let empno=Number(params.empno); //undefined, 7786아 ->NaN
            //만약 empno 가 없다??? 이페이지는 동작할 수 있나요??
            //400 에러  : 요청할 때 꼭 필요한 파라미터를 보내지 않았다.
            if(Number.isNaN(empno)){
                res.statusCode=400;
                res.write("<h1>해당 페이지 꼭 필요한 파라미터를 보내지 않았습니다! 400</h1>");
                res.end();
                return; //응답이 완료되어도 밑에 코드가 실행될 수도 있어서 콜백함수을 종료함
            }
            let sql="SELECT * FROM EMP WHERE EMPNO=?"; //? : preparedStatement
            const [rows,f]=await pool.query(sql,[empno]);
            let html=pug.renderFile("./templates/empDetail.pug",{emp:rows[0]});
            //무조건 SELECT 의 결과는 배열이다.
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empUpdate.do"&&req.method==="GET"){
            let empno=Number(params.empno);
            if(Number.isNaN(empno)){
                res.statusCode=400;
                res.write("<h1>해당 페이지 꼭 필요한 파라미터를 보내지 않았습니다! 400</h1>");
                res.end();
                return;
            }
            let sql="SELECT * FROM EMP WHERE EMPNO=?"; //? : preparedStatement
            const [rows,f]=await pool.query(sql,[empno]);
            let html=pug.renderFile("./templates/empUpdate.pug",{emp:rows[0]});
            res.write(html);
            res.end();
        }else{
            res.statusCode=404;
            res.setHeader("content-type","text/html;charset=UTF-8")
            res.write("<h1>존재하지 않는 페이지 입니다. 404</h1>");
            res.end();
        }
    }
});
