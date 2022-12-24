
var LegalWordSet;
var WordSize;
var Word;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomItem(theset) {
    const array = [];
    theset.forEach(v => array.push(v));
    return array[Math.floor(Math.random() * array.length)];
}

$( window ).on("load", function() {


    $.get('words.txt', function(data) {
        LegalWordSet = new Set(data.split(/\r?\n/));
        console.log(LegalWordSet);
        Word = getRandomItem(LegalWordSet);
        NewWord = Word;
        WordSize = Word.length;
        for (var i = 0; i < Word.length; i++) {
            Input = jQuery("<input id=\"l"+i.toString()+"\" value=\""+Word.charAt(i)+"\"style=\"font-size:20px; font-weight: bold; margin-right: 10px; width: 4ch; height: 4ch; text-align: center; float:left;\" type=\"text\" />");
            $("#reference").append(Input)
            $("#l"+i.toString()).prop('disabled', true);
        }

        for (var i = 0; i < NewWord.length; ++i) {
            Input = jQuery("<input class=\"inputs\" maxlength=\"1\" id=\"i"+i.toString()+"\" placeholder=\""+Word.charAt(i)+"\"style=\"font-size:20px; font-weight: bold; margin-right: 10px; width: 4ch; height: 4ch; text-align: center; float:left;\" type=\"text\" />");
            $("#user_inp").append(Input)
        }

        $(".inputs").keyup(function () {
            if (this.value.length == this.maxLength) {
              var $next = $(this).next('.inputs');
              if ($next.length)
                  $(this).next('.inputs').focus();
              else
                  $(this).blur();
            }
        });

    }, 'text');    

});

function validate() {
    var UserWord = "";
    for (var i = 0; i < WordSize; i++) {
        UserWord += $("#i"+i.toString()).val();
    }
    console.log(UserWord);

    if(LegalWordSet.has(UserWord)) {
        console.log("Success!");
    }
}
