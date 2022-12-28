
var Word;
const Submissions = new Set();
const WordCharSet = new Set();


function disableInput(InputIDNum) {
    for (var i = 0; i < Word.length; i++) {
        $("#i"+InputIDNum.toString()+i.toString()).prop('disabled', true);
    }
}

function animateInput(InputIDNum) {
    for (var i = 0; i < Word.length; i++) {
        var ElRef = "#i"+InputIDNum.toString()+i.toString();
        if (!$(ElRef).val()) {
            $(this).css("background-color", 'transparent');
            continue;
        }

        if (!WordCharSet.has($(ElRef).val())) {
            $(ElRef).css("background-color", 'rgb(239, 203, 104, 0.35)');
        } else {
            $(ElRef).css("background-color", 'rgb(112, 169, 161, 0.35)');
        }
    }
}

function clearInput(InputIDNum) {
    for (var i = 0; i < Word.length; i++) {
        var ElRef = "#i"+InputIDNum.toString()+i.toString(); 
        $(ElRef).val('');
        $(ElRef).css("background-color", 'transparent');
    }
}

function setInput(InputIDNum, UserWord) {
    for (var i = 0; i < Word.length; i++) {
        $("#i"+InputIDNum.toString()+i.toString()).val(UserWord.charAt(i));
    }
}

function tagScore(InputIDNum, Score, HiScore) { 
    var Input = jQuery("<h2>Score: <em id=\"score\"> "+ Score.toFixed(2) +" </em></h2>");
    $("#user_inp_"+InputIDNum.toString()).append(Input);
    if (HiScore !== null) {
        $('#hiscore').text(HiScore.toFixed(2));
        $('#hiscore-wrap').show();
    }
}

function generateNewInput(InputIDNum) {
    var InputID = InputIDNum.toString();
    $("<div id=\"subrow"+InputID+"\"class=\"row\"></div>").insertBefore("#submit-row");

    var InputWrap = jQuery("<div id=\"user_inp_"+InputID+"\" class=\"column\"></div>");
    $("#subrow"+InputID).append(InputWrap);
    for (var i = 0; i < Word.length; ++i) {
        var Input = jQuery("<input autocorrect=\"off\" autocapitalize=\"none\" class=\"inputs\" maxlength=\"1\" id=\"i"+InputID+i.toString()+"\" style=\"font-size:24px; font-weight: bold; margin-right: 10px; width: 5ch; height: 5ch; text-align: center; float:left;\" type=\"text\" />");
        $("#user_inp_"+InputID).append(Input);
    }

    $(".inputs").keyup(function (event) {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            $(this).val(event.key.toLowerCase());
            AnimateInput(Submissions.size);
        }
        
        if (event.keyCode == 8) {
            $(this).css("background-color", 'transparent');
            $(this).val('');
            $(this).prev('.inputs').focus();
        } else if (this.value.length == this.maxLength) {
          var $next = $(this).next('.inputs');
          if ($next.length)
              $(this).next('.inputs').focus();
          else
              $(this).blur();
        }
    });
}

function getHiScore() {
    $.post("https://word2werd.pythonanywhere.com/get_current_topscoring_word", {}, function(Resp) {    
        if (Resp["valid"]) {
            var HiScore = Resp["hiscore"]
            $('#hiscore').text(HiScore.toFixed(2));
            $('#hiscore-wrap').show();
            if(Submissions.size > 2 && $("#word-def").text() != Resp["word"]) {
                $("#hiscore-def").hide();
                $("#hiscore-def").empty();
                var TopWord = jQuery("<h1>Best Scoring Word: <em id=\"word-def\">"+Resp["word"]+"</em></h1>");
                $("#hiscore-def").append(TopWord);

                try {
                    $.get("https://api.dictionaryapi.dev/api/v2/entries/en/"+Resp["word"], function(GetResp){
                        var AllMeanings = GetResp[0]["meanings"];
                        var DefCount = 0;
                        for (const Meaning in AllMeanings) {
                            for (const Definitions in AllMeanings[Meaning]["definitions"]) {
                                var Def = AllMeanings[Meaning]["definitions"][Definitions]["definition"]
                                var DefP = jQuery("<p><em>"+AllMeanings[Meaning]["partOfSpeech"]+"</em>: "+Def+"</p>");
                                $("#hiscore-def").append(DefP);   
                                DefCount +=1;
                                if (DefCount > 4)
                                    break;
                            }
                        }
                    });
                } catch(e) {
                    // Do Nothing here.
                }
                $("#hiscore-def").show();
            }
        }

    }).done(function(){
        setTimeout(getHiScore, 3000);
    }).fail(function() {
        console.log("Error: POST failed. Contact nicholas.giamblanco@gmail.com");
    });    
}

$( window ).on("load", function() {

    const TippyMenu = ['howtoplay', 'scoring', 'example']
    for (const Idx in TippyMenu) {
        const ID = TippyMenu[Idx];
        const template = document.getElementById(ID+"-div");
        template.style.display = 'block';        
        tippy('#'+ID, {
          content: template,
          allowHTML: true,
          animation: "fade",
          arrow: true,
          trigger: "click",
          theme: "light",
          interactive: true,
          placement: "bottom"
        });
    }

    getHiScore();
    $.post("https://word2werd.pythonanywhere.com/get_word_of_the_day", {}, function(Resp) {
        Word = Resp["word-of-the-day"]

        for (var i = 0; i < Word.length; i++) {
            WordCharSet.add(Word.charAt(i));
            var Input = jQuery("<input id=\"l"+i.toString()+"\" value=\""+Word.charAt(i)+"\"style=\"font-size:24px; font-weight: bold; margin-right: 10px; width: 5ch; height: 5ch; text-align: center; float:left;\" type=\"text\" />");
            $("#reference").append(Input)
            $("#l"+i.toString()).prop('disabled', true);
        }
        if (localStorage.getItem("WordOfDay") != Word) {
            localStorage.clear();
            localStorage.setItem('WordOfDay', Word);
        } else {
            // Rebuild from Local Storage.
            if (localStorage.getItem("NumSubmissions") !== null) {
                var NumSubmissions = parseInt(localStorage.getItem("NumSubmissions"));

                for(var i = 0; i < NumSubmissions; ++i) {
                    var Score = parseFloat(localStorage.getItem("Score"+i.toString()));
                    var UserWord = localStorage.getItem("Submission"+i.toString());
                    generateNewInput(i);
                    setInput(i, UserWord)
                    tagScore(i, Score, null);
                    disableInput(i);
                    animateInput(i);
                    Submissions.add(UserWord);
                }
            }
        }
        if (Submissions.size < 3) {
            generateNewInput(Submissions.size);
        }
    }).fail(function() {
        console.log("Error: POST failed. Contact nicholas.giamblanco@gmail.com");
    });
});

function indicateInvalid(UserWord) {
    clearInput(Submissions.size);
    Toastify({
        text: UserWord+" is not a valid word!",
        duration: 2000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function(){} // Callback after click
      }).showToast();        
}

function validate() {

    var UserWord = "";
    var NewChars = 0;
    var SubID = Submissions.size.toString()
    for (var i = 0; i < Word.length; i++) {
        UserChar = $("#i"+SubID+i.toString()).val();
        if (!WordCharSet.has(UserChar))
            NewChars+=1;
        UserWord += UserChar;
    }

    if (Submissions.size > 2) {
        // TODO: Hit Max.
        Toastify({
            text: "You've already submitted 3 words :O!",
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            onClick: function(){} // Callback after click
          }).showToast();
        return;
    }

    if (UserWord.length != Word.length) {
        return;
    }

    if (UserWord != Word && !Submissions.has(UserWord)) {
        $.post("https://word2werd.pythonanywhere.com/get_word_freq", {"word": UserWord, "newchars" : NewChars}, function(Resp) {
            var Score = Resp["score"]
            var HiScore = Resp["hiscore"]

            if (Resp["valid"]) {
                tagScore(Submissions.size, Score, HiScore);
                disableInput(Submissions.size);
                animateInput(Submissions.size);
                // Add this to storage.
                localStorage.setItem('Submission'+Submissions.size.toString(), UserWord);
                localStorage.setItem('Score'+Submissions.size.toString(), Score);
                Submissions.add(UserWord);
                localStorage.setItem('NumSubmissions', Submissions.size);

                if (Submissions.size < 3) {
                    generateNewInput(Submissions.size);
                }
            } else {
                indicateInvalid(UserWord);              
            }

        }).fail(function() {
            console.log("Error: POST failed. Contact nicholas.giamblanco@gmail.com");
        }); 
    
    } else {
        clearInput(Submissions.size);
        var Message = "You've already submitted this word!";
        if (UserWord == Word) {
            Message = "You cannot submit the word of the day!";
        }

        Toastify({
            text: Message,
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            onClick: function(){} // Callback after click
          }).showToast();
    }
}
