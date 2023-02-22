//window.onload : 브라우저가 document 를 모두 load 하고 image 와 스타일 적용까지 완료한 시점
window.onload=function (e){
    const empInsertForm=document.forms["empInsertForm"];
    console.log(empInsertForm);//스크립트가 dom node 생성보다 먼저 실행되서
}
window.onload=function (e){
    console.log("두번째 콜백함수!")
}
//node 에 이벤트의 콜백함수를 직접정의하면 마직막 콜백함수만 실행된다.
window.addEventListener("load",(e)=>{
    console.log("addEventListener 로 정의한 콜백함수");
});
//document.DOMContentLoaded : 브라우저가 document 를 모두 load 한 시점 (addEventListener 로만 작성 가능)
document.addEventListener("DOMContentLoaded",(e)=>{
    console.log("DOMContentLoaded 로 정의한 콜백함수");
});
//항의!! 콜백함수에 정의하는 것 너무너무너무 보기 싫고 코드도 복잡하다!!
//script 에 defer(boolean) 라는 속성을 제공 : DOMContentLoaded 시점까지 기다렸다가 script 문서를 실행!
const empInsertForm=document.forms["empInsertForm"];
empInsertForm.empno.onchange=async function (e){
    //AJAX (XMLHttpRequest,fetch)
    let val=this.value;
    const parentNode=(this.closest(".inputCont"));

    let url="/empnoCheck.do?empno="+val;
    const res=await fetch(url); //.then((res)=>{return res.json()})
    if(res.status==200){
        const obj=await res.json(); //.then((obj)=>{...})
        //console.log(obj)
        if(obj.checkId){
            empnoMsg.innerText=obj.emp.ENAME+"님이 사용 중인 사번입니다."
            parentNode.classList.add("error");
            parentNode.classList.remove("success");

        }else{
            empnoMsg.innerText="사용 가능한 사번입니다."
            parentNode.classList.add("success");
            parentNode.classList.remove("error");
        }
    }else if(res.status==400){
        this.value="";
        alert("정수만 입력하세요!");
    }else {
        alert(res.status+" 오류입니다. 다시 시도!");
    }
}

empInsertForm.mgr.onchange=async function (e){
    let val=this.value;
    const parentNode=(this.closest(".inputCont"));
    let url="/empnoCheck.do?empno="+val;
    const res=await fetch(url);
    if(res.status==200){
        const obj=await res.json();
        if(obj.checkId){
            mgrMsg.innerText=obj.emp.ENAME+"님이 상사로 지정됩니다."
            parentNode.classList.remove("error");
            parentNode.classList.add("success");
        }else{
            mgrMsg.innerText="존재하지 않는 사원입니다."
            parentNode.classList.remove("success");
            parentNode.classList.add("error");
        }
    }else if(res.status==400){
        this.value="";
        mgrMsg.innerText="정수만 입력하세요!"
        parentNode.classList.remove("success");
        parentNode.classList.add("error");
    }else {
        this.value="";
        mgrMsg.innerText=res.status+" 오류입니다. 다시 시도!"
        parentNode.classList.remove("success");
        parentNode.classList.add("error");
    }
}

empInsertForm.deptno.onchange=async function (e){
    let val=this.value;
    const parentNode=(this.closest(".inputCont"));
    let url="/deptnoCheck.do?deptno="+val;
    const res=await fetch(url);
    if(res.status==200){
        const obj=await res.json();
        if(obj.checkId){
            deptnoMsg.innerText=`${obj.dept.DNAME}(${obj.dept.LOC}) 부서로 배치됩니다.`
            parentNode.classList.remove("error");
            parentNode.classList.add("success");
        }else{
            deptnoMsg.innerText="존재하지 않는 부서입니다."
            parentNode.classList.remove("success");
            parentNode.classList.add("error");
        }
    }else if(res.status==400){
        this.value="";
        deptnoMsg.innerText="정수만 입력하세요!"
        parentNode.classList.remove("success");
        parentNode.classList.add("error");
    }else {
        this.value="";
        deptnoMsg.innerText=res.status+" 오류입니다. 다시 시도!"
        parentNode.classList.remove("success");
        parentNode.classList.add("error");
    }
}