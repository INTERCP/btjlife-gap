var base_url = "http://www.btjkorea.com/btjlife/carpool/";

var ride_idx; // 각 페이지에서 운행 상세보기에 활용되는 매개 변수
var passenger_idx; // 탑승자 승인 또는 취소에 사용되는 매개 변수

function submit_regform() {
  regform = $("form[name='regform']");
  $.ajax({
    type: "POST",
    url: base_url + "register-ride",
    data: regform.serialize(),
    success: function(data) {
      if (data == 1) {
        alert("운행 등록이 완료되었습니다.");
        $.mobile.navigate("#btjcarpool-myride-list");
      } else {
        alert("server error!");
      }
    },
    error: function(e) {
      alert("ajax error!! : " + e);
    }
  });
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

// 운행 등록 페이지
$( "#btjcarpool-regride" ).on( "pageshow", function( event ) {
  if(typeof name != 'undefined') {
    $("input[name='driver_name']").val(name);
  }

  if(typeof hp != 'undefined') {
    $("input[name='driver_hp']").val(hp);
  }

  if(typeof sex != 'undefined') {
    $("input[name='driver_sex']").val(sex);
  }

  $("form[name='regform']").enhanceWithin();
});

// 나의 운행 현황 목록 페이지
$( "#btjcarpool-myride-list" ).on( "pageshow", function( event ) {
  $.ajax({
    type: "GET",
    url: base_url + "rides",
    data: {"name": name, "hp":hp},
    success: function(data) {
      var rides = data['rides'];
      var date;
      var inner_html = "<ul data-role='listview'>";
      for ( var i in rides ) {
        var ride = rides[i];

        var departure_at = ride['departure_at'].split(" ");

        if(date != departure_at[0]) {
          date = departure_at[0];
          inner_html += "<li data-role='list-divider'>" + date + "</li>";
        }

        var dateArr = departure_at[0].split("-");
        var timeArr = departure_at[1].split(":");

        var unapproved = 0;
        passengers = ride['passengers']
        for ( var j in passengers) {
          if ( passengers[j]['approved'] == 0 ) {
            unapproved += 1;
          }
        }

        inner_html += "<li><a class='to_myride' data-idx='" + ride['idx'] + "'>[" + ride['origin'] + "] -> [" + ride['destination'] + "] ";
        inner_html += timeArr[0] + "시 " + timeArr[1] + "분 " + ride['driver_name'];
        if ( unapproved > 0 ) {
          inner_html += "<div style='float:right'><span class='ui-li-count ui-btn-corner-all countBubl'>" + unapproved + "</span></div>";
        }
        inner_html += "</a></li>";
      }

      inner_html += "</ul>";
      $('#myride-list-result').html(inner_html);
      $('#myride-list-result').enhanceWithin();

      $(".to_myride").on("click", function(event) {
        event.preventDefault();

        ride_idx = $(this).attr("data-idx");
        $.mobile.navigate("#btjcarpool-myride");
      });
    },
    error: function() {
      alert("error!!");
    }
  });
});


// 나의 운행 현황 페이지
$( "#btjcarpool-myride" ).on( "pageshow", function( event ) {
  $.ajax({
    type: "GET",
    url: base_url + "ride/" + ride_idx,
    dataType: 'json',
    success: function(ride) {
      // var ride = data['ride'];
      var inner_html = "<p>출발지 : " + ride['origin'] + "</p>";
      inner_html += "<p>목적지 : " + ride['destination'] + "</p>";
      inner_html += "<p>출발시간 : " + ride['departure_at'] + "</p>";
      inner_html += "<p>운전자 이름 : " + ride['driver_name'] + "</p>";
      inner_html += "<p>운전자 연락처 : " + ride['driver_hp'] + "</p>";
      inner_html += "<p>남은 자리 : " + ride['capacity'] + "</p>";
      inner_html += "<p>운행 목적 : " + ride['purpose'] + "</p>";
      inner_html += "<p>비고 : " + ride['memo'] + "</p>";

      inner_html += "<br/>";
      inner_html += "<h2>탑승자 목록</h2>";
      inner_html += "<ul data-role='listview'>";
      for ( var i in ride['passengers'] ) {
        var passenger = ride['passengers'][i];

        if(passenger['approved'] == 1) {
          inner_html += "<li>" + passenger['name'] + ' '
          + passenger['hp'] + ' '
          + passenger['sex']
          + "<div style='float: right;'><a class='toggle_approved' data-idx='" + passenger['idx'] + "'>취소</a></div>" + "</li>";
        }
      }
      inner_html += "</ul>";

      inner_html += "<br/>";
      inner_html += "<h2>신청자 목록</h2>";
      inner_html += "<ul data-role='listview'>";
      for ( var i in ride['passengers'] ) {
        var passenger = ride['passengers'][i];

        if(passenger['approved'] == 0) {
          inner_html += "<li>" + passenger['name'] + ' '
          + passenger['hp'] + ' '
          + passenger['sex']
          + "<div style='float: right;'><a class='toggle_approved' data-idx='" + passenger['idx'] + "'>승인</a></div>" + "</li>";
        }
      }
      inner_html += "</ul>";

      $('#myride-result').html(inner_html);
      $('#myride-result').enhanceWithin();

      $(".toggle_approved").on("click", function(event) {
        event.preventDefault();

        passenger_idx = $(this).attr("data-idx");
        $.ajax({
          type: "GET",
          url: base_url + "toggle-approved/" + passenger_idx,
          dataType: 'json',
          success: function(data) {
            if(data == "1") {
              // refresh
              $( "#btjcarpool-myride" ).trigger("pageshow");
              $("#btjcarpool-myride").listview("refresh");
            } else {
              alert("server error!");
            }
          },
          error: function() {
            alert("ajax error!!");
          }
        });
      });
    },
    error: function() {
      alert("error!!");
    }
  });
});

// 이용신청하기 (운행 목록) 페이지
$( "#btjcarpool-ridelist" ).on( "pageshow", function( event ) {
  $.ajax({
    type: "GET",
    url: base_url + "rides",
    success: function(data) {
      var rides = data['rides'];
      var inner_html = "<ul data-role='listview'>";
      var date;
      for ( var i in rides ) {
        var ride = rides[i];

        var departure_at = ride['departure_at'].split(" ");

        if(date != departure_at[0]) {
          date = departure_at[0];
          inner_html += "<li data-role='list-divider'>" + date + "</li>";
        }

        var dateArr = departure_at[0].split("-");
        var timeArr = departure_at[1].split(":");

        inner_html += "<li><a class='to_ride' data-idx='" + ride['idx'] + "'>[" + ride['origin'] + "] -> [" + ride['destination'] + "] ";
        inner_html += timeArr[0] + "시 " + timeArr[1] + "분 " + ride['driver_name'];
        inner_html += "<div style='float:right'><span class='ui-li-count ui-btn-corner-all countBubl'>" + ride['capacity'] + "</span></div>";
        inner_html += "</a></li>";
      }

      inner_html += "</ul>";

      $('#ridelist-result').html(inner_html);
      $('#ridelist-result').enhanceWithin();

      $(".to_ride").on("click", function(event) {
        event.preventDefault();

        ride_idx = $(this).attr("data-idx");
        $.mobile.navigate("#btjcarpool-ride");
      });
    },
    error: function() {
      alert("error!!");
    }
  });
});

// 이용 신청하기(운행 상세) 페이지
$( "#btjcarpool-ride" ).on( "pageshow", function( event ) {
  $.ajax({
    type: "GET",
    url: base_url + "ride/" + ride_idx,
    dataType: 'json',
    success: function(ride) {
      // var ride = data['ride'];
      var inner_html = "<p>출발지 : " + ride['origin'] + "</p>";
      inner_html += "<p>목적지 : " + ride['destination'] + "</p>";
      inner_html += "<p>출발시간 : " + ride['departure_at'] + "</p>";
      inner_html += "<p>운전자 이름 : " + ride['driver_name'] + "</p>";
      inner_html += "<p>운전자 연락처 : " + ride['driver_hp'] + "</p>";
      inner_html += "<p>남은 자리 : " + ride['capacity'] + "</p>";
      inner_html += "<p>운행 목적 : " + ride['purpose'] + "</p>";
      inner_html += "<p>비고 : " + ride['memo'] + "</p>";

      inner_html += "<br/>";
      inner_html += "<a href='#' data-idx='" + ride['idx'] + "' class='to_apply ui-btn ui-corner-all'>신청하기</a>"

      $('#ride-result').html(inner_html);
      $('#ride-result').enhanceWithin();

      $(".to_apply").on("click", function(event) {
        event.preventDefault();

        ride_idx = $(this).attr("data-idx");
        $.mobile.navigate("#btjcarpool-apply");
      });
    },
    error: function() {
      alert("error!!");
    }
  });
});

// 이용신청하기 신청서 작성
$( "#btjcarpool-apply" ).on( "pageshow", function( event ) {
  if(typeof name != 'undefined') {
    $("input[name='name']").val(name);
  }

  if(typeof hp != 'undefined') {
    $("input[name='hp']").val(hp);
  }

  if(typeof sex != 'undefined') {
    $("input[name='sex']").val(sex);
  }

  if(typeof ride_idx != 'undefined') {
    $("input[name='ride_idx']").val(ride_idx);
  }

  $("form[name='applyform']").enhanceWithin();
});


// 나의 카풀신청 현황
$( "#btjcarpool-myapply-list" ).on( "pageshow", function( event ) {
  $.ajax({
    type: "GET",
    url: base_url + "rides",
    data: {"passenger_name": name, "passenger_hp":hp},
    success: function(data) {
      var rides = data['rides'];
      var date;
      var inner_html = "<ul data-role='listview'>";
      for ( var i in rides ) {
        var ride = rides[i];

        var departure_at = ride['departure_at'].split(" ");

        if(date != departure_at[0]) {
          date = departure_at[0];
          inner_html += "<li data-role='list-divider'>" + date + "</li>";
        }

        var dateArr = departure_at[0].split("-");
        var timeArr = departure_at[1].split(":");

        var approved;

        for (var j in ride['passengers']) {
          var passenger = ride['passengers'][j];
          if (passenger['name'] == name && passenger['hp'] == hp) {
            approved = passenger['approved'];
          }
        }

        var approved_text;

        if (approved == 0) {
          approved_text = "승인안됨";
        } else {
          approved_text = "승인됨";
        }

        inner_html += "<li>[" + ride['origin'] + "] -> [" + ride['destination'] + "] ";
        inner_html += timeArr[0] + "시 " + timeArr[1] + "분 " + ride['driver_name'] + "<div style='float: right;'>" + approved_text + " <a href='#'>신청취소</a></div></li>";
      }

      inner_html += "</ul>";
      $('#myapplylist-result').html(inner_html);
      $('#myapplylist-result').enhanceWithin();

    },
    error: function() {
      alert("error!!");
    }
  });
});
