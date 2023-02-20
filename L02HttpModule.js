const http=require("http");
//nodejs 에서 라이브러리(모듈)를 임폴트 하는 방법
// http : http 서버를 생성하고 클라언트의 요청을 처리할 수 있다. (웹앱서버)
http.createServer(function(req,res){
    let url=req.url.split("?")[0];//요청한 리소스의 주소
    let queryString=req.url.split("?")[1]; //요청한 파라미터들
    console.log(url)
    res.setHeader("content-type","text/html;charset=UTF-8");
    if(url=="/"){ //index 동적 페이지
        res.write("<h1>node js 의 http 모듈 안녕!</h1>")
        res.write("<h2>npm 으로 nodemon 설치</h2>")
        res.write("<p>npm 은 노드 패키지 매니저로 라이브러리 의존성 주입을 한다!</p>")
        res.write(`<p>
                      <a href="power.do?a=3&b=6">
                        파라미터 a,b 로 거듭제곱한 결과물을 반환하는 동적페이지
                      </a>
                   </p>`);
        res.end();
    }else if(url=="/power.do"){
        //req.getParameter(key) return val
        //"?a=10&b=20&key3=val..."
        const params=queryString.split("&"); //["key=val","key2=val2",....]
        const paramObj={};
        params.forEach((param)=>{ //"key=val"
            let key=param.split("=")[0];
            let val=param.split("=")[1];
            paramObj[key]=val;
        });
        //{key:val,key2:val2, ...} //프로그래머
        console.log(paramObj);
        res.write(`<h1>${paramObj.a} 거듭 제곱 ${paramObj.b} 의 결과는 : 
                        ${Math.pow(paramObj.a,paramObj.b)}
                   </h1>`);
        res.end();
    }else{ //찾는 리소스가 없는 것 (톰캣은 자동으로)
        req.statusCode=404;
        res.write("<h1>404 찾는 리소스가 없습니다!</h1>");
        res.end();
    }
}).listen(7070); //ip주소:7070 =>서버에 접속
//port 0~2000 : os 가 시스템 어플을위해 사용 중
//port 3306 : mysql 이 설치되면
//port 80 : 해당 컴퓨터 서버컴퓨터가되면 서버를 서비스하기 위한 기본 포토
