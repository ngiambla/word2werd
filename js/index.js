
var LegalWordSet;
var LegalWordDict;
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
    });

    $.getJSON("data/word-freq.json", function( data ) {
        // Create a dictionary here.
        LegalWordDict = {}

        $.each( data, function(theword, val ) {
            LegalWordDict[theword] = val;
        });

        Word = getRandomWord(Object.keys(LegalWordDict));
        while(Word.length > 7)
            Word = getRandomWord(Object.keys(LegalWordDict));

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

    console.log(UserWord);
    if (UserWord in LegalWordDict || LegalWordSet.has(UserWord)) {
        var Freq = 7;
        if (UserWord in LegalWordDict) {
            Freq = LegalWordDict[UserWord]
        }
        var Score = Freq*10
        if (IllegalWordCount > 0) {
            Score *= (1.0/(2*IllegalWordCount));
        }
        if (NewChars > 0) {
            Score *= (1.0/(4*NewChars));
        }

        $('#score').text(Score);
        Submissions.add(UserWord)
    } else {
        if (!Submissions.has(UserWord)) {
            IllegalWordCount+=1;
            $('#attempts').text(IllegalWordCount);
            Submissions.add(UserWord)
        }
    }
}
