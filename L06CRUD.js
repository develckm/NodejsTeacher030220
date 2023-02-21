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
        }else if(urlObj.pathname==="/empUpdate.do"&&req.method==="POST"){
            //data 를 수정한는 동적리소스 (액션페이지)
            //dml을 실행할때는 오류가 종종 발생하기 때문에 꼭 예외처리를 하세요!
            //querystring 은 url 에 오는 파라미터만 객체로 파싱중
            //post 로 오는 파라미터는 요청해더의 본문을 해석해서 받아와야한다.
            let postquery="";
            let update=0; //0이면 실패 1이면 성공
            req.on("data",(param)=>{
                postquery+=param;
            });//요청해더의 문서을 읽는 이벤트 (post 로 넘긴 querystring 불러오기)
            req.on("end",async ()=>{
                console.log(postquery);
                const postPs=querystring.parse(postquery);
                try {
                    let sql=`UPDATE EMP SET ENAME=?,SAL=?,COMM=?,JOB=?,MGR=?,DEPTNO=? WHERE EMPNO=?`
                    const [result]=await pool.execute(sql,[postPs.ename, postPs.sal, postPs.comm, postPs.job, postPs.mgr, postPs.deptno, postPs.empno]) //DML
                    console.log(result);
                    update=result.affectedRows;
                }catch (e) {
                    console.error(e);
                }
                //오류없이 잘실행되고 update 도 잘되면 update=1
                if(update>0){
                    //302 : redirect 이페이지가 응답하지 않고 다른 페이지가 응답하도록 서버 내부에서 요청
                    res.writeHead(302,{location:"/empDetail.do?empno="+postPs.empno});
                    res.end();
                }else{
                    res.writeHead(302,{location:"/empUpdate.do?empno="+postPs.empno});
                    res.end();
                }//20분까지 쉬었다가 와서 삭제하고 등록해보겠습니다.
            });//요청해더의 문서을 모두 다 읽으면 발생하는 이벤트
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="GET"){//등록 form
            let html=pug.renderFile("./templates/empInsert.pug");
            res.write(html);
            res.end();
        }else if(urlObj.pathname==="/empInsert.do"&&req.method==="POST"){//등록 action
            let postQuery=""
            req.on("data",(p)=>{postQuery+=p;});
            req.on("end",async ()=>{
                const postPs=querystring.parse(postQuery);
                for(let key in postPs){ //input value="" => null 값을 기대하지만 문자열 공백이 온다.(mgr,deptno,comm=>null)
                    if(postPs[key].trim()==="")postPs[key]=null;
                }
                let sql=`INSERT INTO EMP (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) 
                                    VALUE (?,?,?,?,NOW(),?,?,?)`;
                let insert=0;
                try {
                    const [result]=await pool.execute(sql,
                        [postPs.empno,postPs.ename,postPs.job,postPs.mgr,postPs.sal,postPs.comm,postPs.deptno]);
                    insert=result.affectedRows;
                }catch (e) {
                    console.error(e)
                }
                if(insert>0){
                    res.writeHead(302,{location:"/empList.do"});
                    res.end();
                }else{
                    res.writeHead(302,{location:"/empInsert.do"});
                    res.end();
                }
            });//4시 15분까지 쉬었다 삭제하고 나머지 자습~ dept crud
        }else if(urlObj.pathname==="/empDelete.do"){ //삭제 액션 페이지
            let empno=Number(params.empno);
            //400처리 해보세요~
            let sql="DELETE FROM EMP WHERE EMPNO=?";
            let del=0;  //delete 필드를 삭제하는 연산자 예약어
            try {
                const [result]=await pool.execute(sql,[empno]);
                del=result.affectedRows;
            }catch (e) {
                console.error(e)
            }
            if(del>0){
                res.writeHead(302,{location:"/empList.do"});
                res.end();
            }else {
                res.writeHead(302,{location:"/empUpdate.do?empno="+params.empno});
                res.end();
            }

        }else{
            res.statusCode=404;
            res.setHeader("content-type","text/html;charset=UTF-8")
            res.write("<h1>존재하지 않는 페이지 입니다. 404</h1>");
            res.end();
        }
    }
});
