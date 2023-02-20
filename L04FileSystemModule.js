//모듈 : 어플리케이션이나 라이브러리 등을 모듈 (개발자에 의해 생산된 가장 작은 단위)
//라이브러리 : 필요에 의해서 사용되는 객체
//어플리케이션 : 유저에게 서비스 되는 것
//패키지 : 유사한 사용을 위해 모인 객체의 집단 (컬렉션프레임워크 List,Map,Set,Date)
//프레임워크 : 모듈을 제어하고 프로그래밍 시 프레임워크에 규칙에 따를 때
//여러 라이브러리의 집단으로 특정 서비스가 가진 한계를 벗어나기 위해 그 서비스 전체를 제어하는 단위
//spring : 톰캣이 가진 불안정성과 객체지향의 한계를 벗어나기 위해 관점지향을 적용하는 프레임워크
//expressjs : nodejs 가 갖는 불편함(1~10까지 다 구현해야하는 것)을 해소하고 미들웨어를 적용하는 프레임워크
//프레임워크의 단점  : 배우기 어렵다, 작은 서비스에 적용하기 어렵다.

//nodejs : 서버에서 실행되는 언어 (자바스크립트), node js 가 npm 을 제공하고 있다.
const http=require("http");
const url=require("url"); //url 에서 path 와 queryString 을 분리
const querystring=require("querystring");//queryString 을 Object 로 변환
const fs=require("fs");//java FileReader+Writer : 파일을 문자열로 불러오는 것
const fsPromise=require("fs/promises"); //fs을 프라미스화한 것

const server=http.createServer(); //nodejs 로 구현한 서버 (톰캣)
server.listen(8888);
//클라이언트에서 해당 서버에 요청이 들어올 때 마다 요청 이벤트를 실행
//url : 서버주소+패스+쿼리스트링
//서버주소 : www.naver.com (도메인) 127.3.0.13:80 ip+port 를 맵핑하는 주소
//pathname : /book/detail.do  해당서버에서 공개되고 있는 리소스의 주소
//쿼리스트링 : ?bid=12313k1 해당 동적 리소스에 제공하는 파라미터들
server.on("request", async (req, res)=>{
    const urlObj=url.parse(req.url);
    const params=querystring.parse(urlObj.query);
    const urlSplits=urlObj.pathname.split("/");
    console.log(urlSplits)

    //url 에 패스에 /public/ 이 포함되면 모두 정적리소스다 약속!! (=>public)
    //예) /public/css/a.css
    //예2) /public/html/c.html
    if(urlSplits[1]=="public"){//정적 리소스를 요청함!
        if(urlSplits[2]=="html"){
            res.setHeader("content-type","text/html;charset=UTF-8");
        }else if(urlSplits[2]=="css"){
            res.setHeader("content-type","text/css;");
        }else if(urlSplits[2]=="img"){
            res.setHeader("content-type","image/jpeg;");
        }else if(urlSplits[2]=="js"){
            res.setHeader("content-type","application/javascript;");
        }
        //서버 내부에서 / 로 최상위 상대 주소를 쓰면 c:// or user 하위로 찾아간다.
        try {
            let data = await fsPromise.readFile("."+urlObj.pathname);
            res.write(data);
            res.end();
        }catch (e) {
            console.error(e);
            res.statusCode=500;
            res.write("<h1>500 파일 요청을 실패</h1>");
            res.end();
        }
    }else { //동적 리소스만
        res.setHeader("content-type","text/html;charset=UTF-8");
        if(req.url=="/"){ //동적리소스 (==servlet)
            res.write("<h1>index 페이지 입니다.</h1>");
            res.write("<h2>서버의 리소스 목록</h2>")
            res.write(`
                <ul>
                    <li><a href="a.do">a.do 동적 페이지</a></li>
                    <li><a href="a.do?a=11.3&b=30.333">
                            a+b 를 연산하는 a.do 동적 페이지</a></li>
                    <li><a href="b.html">b.html 정적 페이지</a></li>
                    <li><a href="/public/html/c.html">c.html 정적 페이지</a></li>
                    <li><a href="/public/html/d.html">d.html 정적 페이지</a></li>
                    <li><a href="/public/css/d.css">d.css 스타일시트</a></li>
                    <li><a href="/public/img/d.jpeg">참새 이미지</a></li>

                </ul>
            `);
            res.end();
        }else if(urlObj.pathname=="/a.do"){//a.do 동적리소스
            let a=parseFloat(params.a);
            let b=parseFloat(params.b);
            res.write(`<h1>a.do 페이지 입니다! </h1>`);
            res.write(`<h2> 받아온 파라미터 a 와 b 를 + 연산 : ${a+b} </h2>`);
            res.end();
            //응답을 완료함!(클라이언트가 서버가 응답하는 것을 무한대기할 수도 있다.)
        }else if(urlObj.pathname=="/b.html"){
            fs.readFile("b.html",(err,data)=>{
                if (err) console.error(err);
                res.write(data);
                res.end();
            });
            //res.end(); //fs.readFile() 멀티스레드를 생성해서 비동기 코드기 때문..
        }else {
            res.statusCode=404;//클라언트가 없는 리소스를 요청함
            res.write(`<h1>404 존재하지 않는 페이지 입니다. </h1>`);
            res.end();
        }
    }

});
