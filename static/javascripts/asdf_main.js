var tag = document.createElement('script');
tag.src = "http://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var srtF = ""; //전문(원문) 텍스트 파일
var parsed_srt = []; //원문 파싱된
var quiz_counter = 0; //카운터: 몇번째 시간대 인지
var unshuffled; //셔플 안된 단어들
var howMany_del = 0; //몇번이나 지웠나?
var allRightBool = false; //전부 맞쳤을 경우
var replayBool = false;
var playByButton = false; //스타트 버튼으로 재생했는가
var HowMany_wrongs = 0; //몇번이나 틀렸나?
var wrongsCnt = 0;
var time = 0;
var wrongWord = "";
var vidID; //비디오 아이디
var SuffButton = ["apple", "banna", "orange", "kiwi"]; //화면에 표시되는값
var srtLast = 0; //srt파싱된것의 마지막 번호
var stop4quiz = false;
var player;
var press_passed = false;
$(document).ready(function () {
    /////////영어 음절 테스트
    console.log("page ready!");
    $.getJSON($SCRIPT_ROOT + '/_add_numbers', {
        a: 'testIs'
        , b: 'Good'
    }, function (data) {
        console.log(data.result);
    });
    /////////영어 음절 테스트
    //document.getElementById('player').style.pointerEvents = 'none'; //실사용시 add this line
});

function colorize(sen) {
    return sen.replace(/\B([A-Z]+)/g, function (a) {
        return '<span style="color:#5f5f5f">' + a.toLowerCase() + '</span>';
    });
}

function right_click(my) {
    //responsiveVoice.cancel();
    responsiveVoice.speak(my.innerHTML);
    console.log("right_click")
}

function mouseDown(my, event) {
    if (event.which == 1) {
        responsiveVoice.cancel();
        console.log("mouse_down");
        pressTimer = window.setTimeout(function () {
            responsiveVoice.speak(my.innerHTML);
            press_passed = true;
        }, 200);
    }
}

function mouseUp(my, event) {
    if (event.which == 1) {
        clearTimeout(pressTimer);
        console.log("mouse_up");
        if (!press_passed) {
            my_dis(my);
        }
        press_passed = false;
    }
}

function HtmlDecode(s) {
    var el = document.createElement("div");
    el.innerHTML = s;
    result1 = el.innerText || el.textContent;
    var el2 = document.createElement("div");
    el2.innerHTML = result1;
    result2 = el2.innerText || el2.textContent;
    return result2;
}

function wordOnly(s) {
    var sen = s;
    sen = sen.replace(/\B[^\w' -]+\b/g, "").toLowerCase();
    sen = sen.replace(/\b[^\w' -]+\B/g, "").toLowerCase();
    return sen;
}

function getParams() {
    var param = new Array();
    var url = decodeURIComponent(location.href);
    url = decodeURIComponent(url);
    var params;
    params = url.substring(url.indexOf('?') + 1, url.length);
    params = params.split("&");
    var size = params.length;
    var key, value;
    for (var i = 0; i < size; i++) {
        key = params[i].split("=")[0];
        value = params[i].split("=")[1];
        param[key] = value;
    }
    return param;
}
var p = getParams();
timer = setInterval(timecnt, 1000);

function timecnt() {
    time++;
}

function getSubTry(data, event) {
    var mytext;
    var mystart;
    var myend;
    [].forEach.call(data.getElementsByTagName('text'), function (val) {
        mytext = HtmlDecode(val.innerHTML);
        mystart = val.getAttribute("start") * 1000;
        myend = mystart + val.getAttribute("dur") * 1000;
        parsed_srt.push({
            text: mytext
            , startTime: mystart
            , endTime: myend
        });
    });
    srtLast = parsed_srt.length - 1;
    //////////////영어 음절 테스트
    parsed_srt.forEach(function (value) {
        $.getJSON($SCRIPT_ROOT + '/_tonew', {
            a: value.text
        }, function (data) {
            value.text = data.result
                //newtexts.push(data.result);
        });
    });
    //////////////영어 음절 테스트
    event.target.cueVideoById({
        videoId: p['vid']
    });
    $("#starter").removeClass("myHide");
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        playerVars: {
            controls: 2 //개발시에는 controls: 2, 실사용시에는 controls: 0 
                
            , cc_load_policy: 1
            , rel: 0
            , autohide: 1
            , disablekb: 1
            , iv_load_policy: 3
            , fs: 0
            , gl: 'KR'
            , hl: 'ko'
            , showinfo: 0
        }
        , events: {
            'onReady': onPlayerReady
            , 'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    var request = $.get("static/sub/" + p["vid"] + ".srt");
    request.success(function (data) {
        srtF = data;
        parsed_srt = from_srt(srtF, true);
        srtLast = parsed_srt.length - 1;
        //////////////영어 음절 테스트
        parsed_srt.forEach(function (value) {
            $.getJSON($SCRIPT_ROOT + '/_tonew', {
                a: value.text
            }, function (data) {
                value.text = data.result
                    //newtexts.push(data.result);
            });
        });
        //////////////영어 음절 테스트
        console.log("youtubeReady");
        event.target.cueVideoById({
            videoId: p['vid']
        });
        $("#starter").removeClass("myHide");
    });
    request.fail(function () {
        console.log("자막을 가져오지 못함(자기 컴)");
        $.ajax({
            url: 'http://video.google.com/timedtext?lang=en&v=' + p['vid']
            , success: function (data) {
                try {
                    getSubTry(data, event);
                }
                catch (e) {
                    $.ajax({
                        url: 'http://video.google.com/timedtext?lang=en-GB&v=' + p['vid']
                        , success: function (data) {
                            try {
                                getSubTry(data, event);
                            }
                            catch (e) {
                                console.log(e);
                                console.log("자막을 가져오지 못함(유튜브)");
                                alert("자막이 없습니다.");
                                window.location.href = "/";
                            }
                        }
                        , error: function () {
                            console.log("자막을 가져오지 못함(유튜브)");
                            alert("로딩error");
                        }
                    });
                }
            }
            , error: function () {
                console.log("자막을 가져오지 못함(유튜브)");
                alert("로딩error");
            }
        });
    });
}

function onPlayerStateChange(event) {
    switch (event.data) {
    case YT.PlayerState.UNSTARTED:
        console.log('unstarted');
        break;
    case YT.PlayerState.ENDED:
        console.log('ended');
        alert("END");
        window.location.href = "/";
        break;
    case YT.PlayerState.PLAYING:
        if (!playByButton) {
            player.stopVideo();
            alert("start버튼으로 재생해주세요");
        }
        console.log('--playing--');
        stop4quiz = false;
        setTimeout(function () {
            replayBool = false;
        }, 3000);
        my_timer = setInterval(check_where, 5);
        $("#buttonP").html(""); //버튼 초기화
        //$("#textP").html("");  //문장 초기화
        howMany_del = 0;
        HowMany_wrongs = 0;
        $("#hintP").html("<h1>" + "힌트" + "</h1>");
        $("#life").html("<h1>" + "틀린횟수" + "</h1>");
        break;
    case YT.PlayerState.PAUSED:
        clearInterval(my_timer);
        console.log('-paused-');
        break;
    case YT.PlayerState.BUFFERING: //중요
        clearInterval(my_timer);
        console.log('buffering');
        break;
    case YT.PlayerState.CUED:
        console.log('video cued');
        break;
    }
}

function lets_start() {
    player.playVideo();
    var fn = function () {
        player.playVideo();
    }
    setTimeout(fn, 3000);
    $("#starter").remove();
    playByButton = true;
    my_timer = setInterval(check_where, 10);
    progress_timer = setInterval(function () {
        var playerTotalTime = player.getDuration();
        var playerCurrentTime = Math.round(player.getCurrentTime());
        var playerTimeDifference = (playerCurrentTime / playerTotalTime) * 100;
        var playerTimePercent = playerTimeDifference.toFixed(2);
        //console.log(playerTimePercent + '%');
        $(".progress-bar").width(playerTimePercent + '%');
    }, 100);
}

function selected_word(i) {
    return $("#buttonP").children().eq(i).children().eq(0).get(0);
}

function id2number(id) {
    return parseInt(id.substr(1));
}
$(document).keydown(function (e) {
    switch (e.keyCode) {
    case 65: //A
        if (selected_word(0) !== undefined) {
            my_dis(selected_word(0));
        }
        break;
    case 83: //S
        if (selected_word(1) !== undefined) {
            my_dis(selected_word(1));
        }
        break;
    case 68: //D
        if (selected_word(2) !== undefined) {
            my_dis(selected_word(2));
        }
        break;
    case 70: //F
        if (selected_word(3) !== undefined) {
            my_dis(selected_word(3));
        }
        break;
    case 37:
        console.log("you pressed 37(<-) left key");
        if (quiz_counter !== 0) {
            clearInterval(my_timer);
            replayBool = false;
            player.seekTo(getPastStart());
            prvWhere();
            player.playVideo();
        }
        break;
    case 39:
        console.log("you pressed 39(->) right key");
        if (quiz_counter < srtLast) {
            clearInterval(my_timer);
            replayBool = false;
            if (!stop4quiz) {
                if (parsed_srt[0].startTime / 1000 > player.getCurrentTime().toFixed(2)) {
                    player.seekTo(getNowStart());
                    nxtWhere();
                }
                else {
                    player.seekTo(getFutureStart());
                    nxtWhere();
                }
            }
            player.playVideo();
        }
        break;
    }
});

function replaces(words) {
    words = words.replace(/<i>/g, "");
    words = words.replace(/<\/i>/g, "");
    words = words.replace(/\n/g, " ");
    words = words.replace(/--/g, "");
    words = words.replace(/\([\s\S]*?\)/g, "");
    words = words.replace(/\B[^\w' ]+\B/g, "");
    words = words.replace(/ +/g, " ");
    words = words.replace(/^\s*/, '');
    words = words.replace(/\s*$/, '');
    return words;
}

function prvWhere() {
    quiz_counter--;
}

function nxtWhere() {
    quiz_counter++;
}

function getPast() {
    return quiz_counter > 0 ? parsed_srt[quiz_counter - 1].endTime / 1000 : 0;
}

function getPastStart() {
    return quiz_counter > 0 ? parsed_srt[quiz_counter - 1].startTime / 1000 : 0;
}

function getNow() {
    if (quiz_counter <= srtLast) {
        return parsed_srt[quiz_counter].endTime / 1000;
    }
    else {
        return player.getDuration() - 0.5;
    }
}

function getNowStart() {
    if (quiz_counter <= srtLast) {
        return parsed_srt[quiz_counter].startTime / 1000;
    }
    else {
        return player.getDuration() - 0.5;
    }
}

function getFuture() {
    if (quiz_counter <= srtLast) {
        return parsed_srt[quiz_counter + 1].endTime / 1000;
    }
    else {
        return player.getDuration() - 0.5;
    }
}

function getFutureStart() {
    if (quiz_counter <= srtLast) {
        return parsed_srt[quiz_counter + 1].startTime / 1000;
    }
    else {
        return player.getDuration() - 0.5;
    }
}

function check_where() {
    var How_video_pasted = player.getCurrentTime().toFixed(2);
    if (!allRightBool) {
        if (getPast() > How_video_pasted) { //진행시간이 과거 보다 작으면
            if (quiz_counter > 0) {
                if (!replayBool && !allRightBool) {
                    console.log(quiz_counter + ": ViewPrv");
                    prvWhere(); //카운터를 줄인다.
                }
            }
        }
        if (getFuture() < How_video_pasted) { //진행시간이 미래 보다 크면
            if (quiz_counter < srtLast) {
                console.log(quiz_counter + ": ViewNxt");
                nxtWhere(); //카운터를 늘린다.
            }
        }
        else {
            if (getNow() <= How_video_pasted && ("" != wordOnly(replaces(parsed_srt[quiz_counter].text)))) { //진행시간이 미래 보다 작고, 현재보다 크면
                console.log("진행 현재보다 큼(멈춤)");
                replayBool = false;
                stop4quiz = true;
                $("#buttonP").html("");
                player.pauseVideo();
                unshuffled = parsed_srt[quiz_counter].text;
                unshuffled = replaces(unshuffled);
                unshuffled = unshuffled.split(" ");
                        [0, 1, 2, 3].forEach(function (i) {
                    if (i < unshuffled.length) SuffButton[i] = unshuffled[i % unshuffled.length];
                });
                SuffButton = shuffle(SuffButton);
                [0, 1, 2, 3].forEach(function (my_x) {
                    $("#buttonP").append('<div class="textboxWidth" style=" float: left;"><button onmousedown="mouseDown(this,event)" onmouseup="mouseUp(this,event)" oncontextmenu="right_click(this);return false;" id=b' + my_x + ' class="btn btn-primary btn-lg center-block" style="color:#000;font-size:17px;position: relative; display: block; height:80px;width:85%; padding:0; margin:0 auto;" >' + wordOnly(SuffButton[my_x]) + "</button></div>");
                });
                $("#textP").html("");
                nxtWhere();
                console.log(quiz_counter + ": 새 버튼 생성");
            }
        }
    }
    else if (getPast() <= How_video_pasted) {
        allRightBool = false;
        if (getPastStart() <= How_video_pasted) { //진행시간이 미래 보다 작고, 현재보다 크면
            $("#textP").html(""); // 자막 지우기
        }
    }
}

function replay() {
    console.log(quiz_counter + ":replay가 불려짐");
    prvWhere();
    player.seekTo(getNowStart() - 0.1);
    replayBool = true;
    player.playVideo();
    HowMany_wrongs = 0;
}

function my_dis(my) {
    if (wordOnly(unshuffled[howMany_del]) == wordOnly(SuffButton[id2number(my.id)])) { //정답일 경우[
        $("#buttonP").html("");
        $("#hintP").html("");
                [0, 1, 2, 3].forEach(function (i) {
            if (i < unshuffled.length) SuffButton[i] = unshuffled[(i + howMany_del) % unshuffled.length];
        });
        SuffButton = shuffle(SuffButton);
                [0, 1, 2, 3].forEach(function (my_x) {
            $("#buttonP").append('<div class="textboxWidth" style="float: left;"><button onmousedown="mouseDown(this,event)" onmouseup="mouseUp(this,event)" oncontextmenu="right_click(this); return false;" id=b' + my_x + ' class="btn btn-primary btn-lg center-block" style="color:#000;font-size:17px;position: relative; display: block; height:80px;width: 85%;padding: 0; margin:0 auto;" >' + wordOnly(SuffButton[my_x]) + "</button></div>");
        });
        //$("#textP").append(unshuffled[howMany_del]);
        $("#textP").append(colorize(unshuffled[howMany_del]) + " ");
        howMany_del++;
        if (unshuffled.length == howMany_del) { //전부 맞첬을 경우
            $("#myprogress").addClass("blinkGreen");
            setTimeout(function () {
                $("#myprogress").removeClass("blinkGreen");
            }, 1000);
            player.seekTo(getPastStart() - 0.1);
            player.playVideo();
            allRightBool = true;
            howMany_del = 0;
        }
    }
    else { //틀릴 경우
        HowMany_wrongs++;
        wrongsCnt++;
        wrongWord += SuffButton[id2number(my.id)] + ",";
        if (HowMany_wrongs == 3) { //3번 틀리면 다시 시작.
            console.log("3번 틀려서 replay를 부름");
            $("#myprogress").addClass("blinkRed");
            setTimeout(function () {
                $("#myprogress").removeClass("blinkRed");
            }, 1000);
            replay();
        }
        else {
            [0, 1, 2, 3].forEach(function (i) {
                if (wordOnly(unshuffled[howMany_del]) == wordOnly(SuffButton[id2number(selected_word(i).id)])) {
                    selected_word(i).style.color = "#ffffff";
                }
            });
            $("#hintP").html("<h1>" + unshuffled[howMany_del] + "</h1>");
        }
    }
}