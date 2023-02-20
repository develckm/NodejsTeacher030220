console.log("안녕하세요!");
//node js 파일명 : v8 엔진 js 파일 실행한다.
//크롬브라우저에서 js 실행 : html 문서에 script 태그가 있으면 v8 엔진이 실행
//java class 파일명 :jvm class 파일의 main 메소드를 실행
//console.log(window); //브라우저에서 js가 실행되면 제공되는 전역필드
//console.log(document);
console.log(this); //node js 에서 정의한 전역필드
//문법은 바닐라 js 를 그대로 따른다.
//window.setInterval(),window.setTimeout() : window 필드말고 전역에 존재함
setInterval(()=>{
    console.log(new Date());
},1000);
//nodejs 는 자바스크립를 서버단에서 사용하기 위한 언어다.
//nodejs 에서 제공하는 필드 중에 서버 모듈(http)이 존재한다.(서버다)
//nodejs 는 maven 처럼 프로젝트 빌드와 라이브러리 의존성 주입을 할 수 있다.(npm)
