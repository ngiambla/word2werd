
var LegalWordSet;
var Word;
var IllegalWordCount=0;
const Submissions = new Set();
const WordCharSet = new Set();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomWord(theset) {
    const array = [];
    theset.forEach(v => array.push(v));
    return array[Math.floor(Math.random() * array.length)];
}

$( window ).on("load", function() {
    $.get('data/words.txt', function(data) {
        LegalWordSet = new Set(data.split(/\r?\n/));
        Word = getRandomWord(LegalWordSet);
        var ValidWordLength = false;
        while(!ValidWordLength) {
            Word = getRandomWord(LegalWordSet);
            if (Word.length > 4 && Word.length < 8)
                ValidWordLength = true;
        }
        NewWord = Word;
        for (var i = 0; i < Word.length; i++) {
            WordCharSet.add(Word.charAt(i));
            Input = jQuery("<input id=\"l"+i.toString()+"\" value=\""+Word.charAt(i)+"\"style=\"font-size:20px; font-weight: bold; margin-right: 10px; width: 4ch; height: 4ch; text-align: center; float:left;\" type=\"text\" />");
            $("#reference").append(Input)
            $("#l"+i.toString()).prop('disabled', true);
        }

        for (var i = 0; i < NewWord.length; ++i) {
            Input = jQuery("<input class=\"inputs\" maxlength=\"1\" id=\"i"+i.toString()+"\" placeholder=\""+Word.charAt(i)+"\"style=\"font-size:20px; font-weight: bold; margin-right: 10px; width: 4ch; height: 4ch; text-align: center; float:left;\" type=\"text\" />");
            $("#user_inp").append(Input)
        }
        $( ".inputs" ).keydown(function( event ) {
            if (event.keyCode >= 65 && event.keyCode <= 90) {
                $(this).val(event.key);
            }
            if (event.keyCode == 8) {
                $(this).val('');
                $(this).prev('.inputs').focus();
            }
        });

        // Autotab to next input.
        $(".inputs").keyup(function () {
            if (this.value.length == this.maxLength) {
              var $next = $(this).next('.inputs');
              if ($next.length)
                  $(this).next('.inputs').focus();
              else
                  $(this).blur();
            }
        });        
    });
});

function validate() {

    var UserWord = "";
    var NewChars = 0;
    for (var i = 0; i < Word.length; i++) {
        UserChar = $("#i"+i.toString()).val();
        if (!WordCharSet.has(UserChar))
            NewChars+=1;  
        UserWord += UserChar;
    }

    if (LegalWordSet.has(UserWord) && UserWord != Word) {
        $.post("https://word2werd.pythonanywhere.com/get_word_freq", {"word": UserWord, "attempts" : IllegalWordCount, "newchars" : NewChars}, function(Resp) {
            var Score = Resp["score"]
            $('#score').text(Score.toFixed(3));
            $('#hiscore').text(Resp["hiscore"].toFixed(3));
            $('#hiscore-wrap').show();
            Submissions.add(UserWord)
        }).fail(function() {
            console.log("Error: POST failed. Contact nicholas.giamblanco@gmail.com");
        }); 
    } else {
        if (!Submissions.has(UserWord)) {
            IllegalWordCount+=1;
            $('#attempts').text(IllegalWordCount);
            Submissions.add(UserWord)
        }
    }
}
