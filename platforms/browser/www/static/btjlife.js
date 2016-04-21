var main_base_url = "http://www.btjkorea.com/btjlife/";

var name; // 사용자 이름을 자동입력 해주는 매개변수
var hp; // 사용자 연락처를 자동입력 해주는 매개변수
var sex; // 사용자 성별을 자동입력 해주는 매개변수
var chaptercode; // 사용자 지부코드, 01일 경우 본부

$(".bonbu").hide();

function login() {
  loginform = $("form[name='loginform']");
  $.ajax({
    type: "POST",
    url: main_base_url + "login",
    data: loginform.serialize(),
    success: function(data) {
      if(data == "login_failed") {
        alert("로그인에 실패하였습니다.");
        // $.mobile.navigate("#home");
      } else {
        name = data['mb_name'];
        hp = data['mb_hp'];
        chaptercode = data['chaptercode'];
        $.mobile.navigate("#home");
      }
    },
    error: function() {
      alert("ajax error!!");
    }
  });
}

$( "#home" ).on( "pageshow", function( event ) {
  if(chaptercode == "01") {
    $(".bonbu").show();
  } else {
    $(".bonbu").hide();
  }
});
