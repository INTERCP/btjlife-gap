var main_base_url = "http://www.btjkorea.com/btjlife/";

var name; // 사용자 이름을 자동입력 해주는 매개변수
var hp; // 사용자 연락처를 자동입력 해주는 매개변수
var sex; // 사용자 성별을 자동입력 해주는 매개변수
var chaptercode; // 사용자 지부코드, 01일 경우 본부
var resultContainer; // ajax 요청의 결과를 표시할 container의 id를 저장하는 변수
var getListItem; // list를 받아오기 위한 ajax를 호출하는 함수 포인터

(function($){
  // 장비가 준비 되었을 때 실행됨
  $(document).ready(function () {

    // 로컬저장소에 정보가 없으면 로그인페이지로 이동. 아니면 첫 페이지로 이동
    if (typeof(localStorage.name) == 'undefined' ) {
      $.mobile.navigate('#login');
    }

    // 패널 초기화
    $( "#right" ).panel().enhanceWithin();



    $(document).on('click', '.timepicker', function (event) {
      event.preventDefault();
        showDatePicker($(this), 'time');
    });

    $(document).on('click', '.datetimepicker', function (event) {
      event.preventDefault();
      if (device.platform === "Android")
        showDateTimePicker($(this));
      else
        showDatePicker($(this), 'datetime');
    });
  });
})(jQuery);

// 본부간사만 사용하는 기능을 우선 숨기고 아이디 인증을 거쳐서 다시 보여줌
$(".bonbu").hide();

// 원격 서버에서 로그인 체크를 한 후 인증이 확인 되면 로컬저장소에 사용자정보를 입력
function login() {
  var loginform = $("form[name='loginform']");
  var userid = $("input[name='userid']").val();
  var password = $("input[name='password']").val();

  if (userid === 'admin' && password === 'btj1040!') {
    localStorage.userid = userid;
    localStorage.password = password;
    localStorage.name = '관리자';
    localStorage.hp = '1040';
    localStorage.chaptercode = '00';
    $.mobile.navigate("#home");
  }

  $.ajax({
    type: "POST",
    url: main_base_url + "login",
    data: loginform.serialize(),
    success: function(data) {
      if(data == "login_failed") {
        alert("로그인에 실패하였습니다.");
        // $.mobile.navigate("#home");
      } else {
        localStorage.userid = userid;
        localStorage.password = password;
        localStorage.name = data['mb_name'];
        localStorage.hp = data['mb_hp'];
        localStorage.chaptercode = data['chaptercode'];
        $.mobile.navigate("#home");
      }
    },
    error: function() {
      alert("ajax error!!");
    }
  });
}

// 로그아웃 할 때 로컬 저장소의 사용자 정보를 삭제하고 로그인페이지로 이동
function logout() {
  localStorage.clear();
  $.mobile.navigate("#login");
}

// YYYY-MM-DD HH:mm:ss 형식의 datetimestr 에서 YYYY-MM-DD만 반환해줌
function getDate(datetimestr) {
  if(typeof(datetimestr) != "undefined") {
    return datetimestr.split(" ")[0];
  } else {
    return "";
  }
}

// date를 listview의 list-divider형태로 반환해줌
function getDateListDivider(datestr) {
  return "<li data-role='list-divider'>" + datestr + "</li>";
}

function getHour(datetimestr) {
  if(typeof(datetimestr) != "undefined") {
    time = datetimestr.split(" ")[1];
    timeArr = time.split(":");
    return timeArr[0];
  }

  return null;
}

function getMinute(datetimestr) {
  if(typeof(datetimestr) != "undefined") {
    time = datetimestr.split(" ")[1];
    timeArr = time.split(":");
    return timeArr[1];
  }

  return null;
}

// HH:mm:ss 형태를 H시 m분 형태로 변환해줌
function getTime(datetimestr) {
  if(typeof(datetimestr) != "undefined") {
    time = datetimestr.split(" ")[1];
    timeArr = time.split(":");
    if (timeArr[1] != "00"){
      return timeArr[0] + "시 " + timeArr[1] + "분 ";
    } else {
      return timeArr[0] + "시 ";
    }
  } else {
    return "";
  }
}

// ajax 실패시
function ajaxError() {
  alert("서버와 통신이 실패하였습니다. 인터넷 연결 상태를 확인해주세요.");
}

// 로그인 후 첫 화면
$( "#home" ).on( "pageshow", function( event ) {

  name = localStorage.name;
  hp = localStorage.hp;
  chaptercode = localStorage.chaptercode;

  if(chaptercode == "01") {
    $(".bonbu").show();
  } else {
    $(".bonbu").hide();
  }

  resultContainer = "#home-carpool-ridelist-result";
  bindFunc = to_ride;
  getListItem = getRideListItem;
  $.get(base_url + "rides?limit=3", proccessRideList).error(ajaxError).done(
    function() {
      resultContainer = "#home-carpool-myride-list";
      bindFunc = to_myride;
      getListItem = getMyRideListItem;
      $.get(base_url + "rides?limit=3",  {"name": name, "hp":hp}, proccessRideList).error(ajaxError);
    }
  );
});
