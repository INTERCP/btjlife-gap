var base_url = "http://www.btjkorea.com/btjlife/carpool/";

var ride_idx; // 각 페이지에서 운행 상세보기에 활용되는 매개 변수
var passenger_idx; // 탑승자 승인 또는 취소에 사용되는 매개 변수

var bindFunc; // list를 로딩한 후 링크를 bind해주는 함수

// 신규 카풀 운행 등록
function carpoolSubmitRegform() {
  regform = $("form[name='regform']").serialize();

  $.post(base_url + "register-ride", regform, function(data) {
    if (data == 1) {
      alert("운행 등록이 완료되었습니다.");
      $.mobile.navigate(cordova.file.applicationDirectory+"www/btjcarpool/myridelist.html");
    } else {
      alert("서버 오류로 카풀 운행 등록이 실패하였습니다.");
    }
  }).error(ajaxError);
}

function carpoolSubmitEditform() {
  editform = $("form[name='editform']").serialize();

  $.post(base_url + "edit-ride/" + ride_idx, editform, function(data) {
    if (data == 1) {
      alert("운행 정보 수정이 완료되었습니다.");
      $.mobile.navigate(cordova.file.applicationDirectory+"www/btjcarpool/myride.html");
    } else {
      alert("서버 오류로 카풀 운행 수정이 실패하였습니다.");
    }
  }).error(ajaxError);
}

function carpoolDeleteRide() {
  $.post(base_url + "delete-ride/" + ride_idx, function(data) {
    if (data == 1) {
      alert("운행 정보 삭제가 완료되었습니다.");
      $.mobile.navigate(cordova.file.applicationDirectory+"www/btjcarpool/myridelist.html");
    } else {
      alert("서버 오류로 카풀 운행 수정이 실패하였습니다.");
    }
  }).error(ajaxError);
}

function carpoolDeletePassenger(passenger_idx) {
  $.post(base_url + "delete-passenger/" + passenger_idx, function(data) {
    if (data == 1) {
      alert("카풀신청 삭제가 완료되었습니다.");
      $.mobile.navigate(cordova.file.applicationDirectory+"www/btjcarpool/myapplylist.html");
    } else {
      alert("서버 오류로 카풀 운행 수정이 실패하였습니다.");
    }
  }).error(ajaxError);
}

function submit_applyform() {
  applyform = $("form[name='applyform']");
  $.ajax({
    type: 'POST',
    url: base_url + "carpool-apply",
    data: applyform.serialize(),
    success: function(data) {
      if (data == 1) {
        alert("카풀 신청이 완료되었습니다.");
        $.mobile.navigate("#btjcarpool-home");
      } else {
        alert("server error!");
      }
    },
    error: function() {
      alert("ajax error!!");
    }
  });
}

function bind_url(container, path) {
  $(container).on("click", function(event) {
    event.preventDefault();

    ride_idx = $(this).attr("data-idx");
    $.mobile.changePage(cordova.file.applicationDirectory+path);
  });
}

// 각 항목을 클릭할 경우 세부 페이지로 이동하도록 클릭 이벤트를 바인드 해줌
function to_ride() {
  bind_url(".to_ride", "www/btjcarpool/ride.html");
}

function to_myride() {
  bind_url(".to_myride", "www/btjcarpool/myride.html");
}

// 운행정보를 담고있는 객체를 listview에 삽입할 html코드로 변환해줌
function getRideListItem(item) {
  var inner_html = "";
  inner_html += "<li><a class='to_ride' data-idx='" + item['idx'] + "'>[" + item['origin'] + "] -> [" + item['destination'] + "] ";
  inner_html += getTime(item['departure_at']) + item['driver_name'];
  inner_html += "<div style='float:right'><span class='ui-li-count ui-btn-corner-all countBubl'>" + item['capacity'] + "</span></div>";
  inner_html += "</a></li>";

  return inner_html;
}

// 나의 운행 정보
function getMyRideListItem(item) {
  var unapproved = 0;
  passengers = item['passengers'];
  for ( var j in passengers) {
    if ( passengers[j]['approved'] == 0 ) {
      unapproved += 1;
    }
  }

  var inner_html = "";
  inner_html += "<li><a class='to_myride' data-idx='" + item['idx'] + "'>[" + item['origin'] + "] -> [" + item['destination'] + "] ";
  inner_html += getTime(item['departure_at']);
  if ( unapproved > 0 ) {
    inner_html += "<div style='float:right'><span class='ui-li-count ui-btn-corner-all countBubl'>" + unapproved + "</span></div>";
  }
  inner_html += "</a></li>";

  return inner_html;
}

// 운행목록 조회하여 서버에서 받아온 결과값을 화면에 보여줌
function proccessRideList(data) {
  var rides = data['rides'];
  var inner_html = "";
  var date; // 날자별로 리스트 항목을 묶기 위해서 항목의 날자와 구분자의 날자가 같은지 체크하는 변수

  for ( var i in rides ) {
    var ride = rides[i];

    var departure_date = getDate(ride['departure_at']);

    // 항목의 날자와 구분자의 날자가 같은지 비교하고 다르면 구분자를 넣어줌
    if(date != departure_date) {
      date = departure_date;
      inner_html += getDateListDivider(date);
    }

    inner_html += getListItem(ride);
  }

  $(resultContainer).html(inner_html);
  $(resultContainer).listview("refresh");
  $(resultContainer).enhanceWithin();

  // 리스트를 클릭했을 때 페이지 이동 이벤트가 잘 발생하도록 bind해줌
  bindFunc();
}

function getRideData(ride) {
  var inner_html = "<p>출발지 : " + ride['origin'] + "</p>";
  inner_html += "<p>목적지 : " + ride['destination'] + "</p>";
  inner_html += "<p>출발시간 : " + ride['departure_at'] + "</p>";
  inner_html += "<p>운전자 이름 : " + ride['driver_name'] + "</p>";
  inner_html += "<p>운전자 연락처 : " + ride['driver_hp'] + "</p>";
  inner_html += "<p>운전자 성별 : " + ride['driver_sex'] + "</p>";
  inner_html += "<p>남은 자리 : " + ride['capacity'] + "</p>";
  inner_html += "<p>운행 목적 : " + ride['purpose'] + "</p>";
  inner_html += "<p>비고 : " + ride['memo'] + "</p>";

  return inner_html;
}
