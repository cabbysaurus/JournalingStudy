// global variables
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var recognition = new webkitSpeechRecognition();
var http = new XMLHttpRequest();


if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  
  // this makes it so that the microphone keeps recording until the user physically stops it
  recognition.continuous = true;
  // this updates results with new words in case context makes the recognition better
  recognition.interimResults = true;
  
  // once the user presses the microphone
  recognition.onstart = function() {
    recognizing = true;
    document.getElementById('info').innerHTML = 'Speak now. Click the microphone icon again when you are done speaking.';
    start_img.src = 'mic-animate.gif';
  };
  
  // error handling
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      document.getElementById('info').innerHTML = 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">microphone settings</a>';
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      document.getElementById('info').innerHTML = 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892"> microphone settings</a> are configured correctly.';
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
    	  document.getElementById('info').innerHTML = 'Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream';
      } else {
        document.getElementById('info').innerHTML = 'Permission to use microphone was denied.';
      }
      ignore_onend = true;
    }
  };
  
  // once the user stops the recording by pressing the mic again
  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = 'mic.gif';
    if (!final_transcript) {
    	document.getElementById('info').innerHTML = 'Click on the microphone icon to begin speaking.';
      return;
    }
    sessionStorage.setItem("journalEndTime", Date.now());
    document.getElementById('info').innerHTML = 'Click the "Next" button below to continue to the next part of the study.';
    sessionStorage.setItem("journalText", final_transcript);
    document.getElementById('appear').innerHTML = '<input class="btn btn-default" type="reset" value="Next" name="voiceJournal" onclick=navToReflection()>';
  };
  
  // runs whenever there is a recognition match, as part of the continuous speech
  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      // final means that it is not longer interim
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    // format the transcripts
    final_transcript = capitalize(final_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}


// if the user needs to upgrade 
function upgrade() {
  start_button.style.visibility = 'hidden';
  document.getElementById('info').innerHTML = 'Web Speech API is not supported by this browser. Upgrade to <a href="//www.google.com/chrome">Chrome</a> version 25 or later.';
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}


// run necessary steps when the mic is first clicked
function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = "en-US";
  recognition.start();
  ignore_onend = false;
  start_img.src = 'mic-slash.gif';
  document.getElementById('info').innerHTML = 'Click the "Allow" button above to enable your microphone.';
  showButtons('none');
  start_timestamp = event.timeStamp;
}

var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
}

// use a random number to determine if the user should do the text or the voice journaling
function getLink() {
	//var a = document.getElementById('journal_link');
	// random isn't working very well - too many text ones. So instead try using the row number from the sheet to determine condition.
	// since it adds a row each time, then every third should be text vs. voice
	// so 2 is skip, 3 is text, 4 is voice
//	let url = 'https://script.google.com/macros/s/AKfycbxClv8WL8CKr6_FdTmyHdolGgKk6-YU8w9OYDJM-zEUDv27xDcs/exec';
//	http.open('GET', url, true);
//	http.send();
//	http.onreadystatechange = processRequest;
	
	rand = Math.random();
	console.log(rand);
	/*if (rand < 0.1) { // already had a lot of these so turning it down
		window.location.href = 'textJournal.html';
		sessionStorage.setItem("condition", "textNeutral");
	}
	else if (rand < 0.2) {
		window.location.href = 'textJournalP.html';
		sessionStorage.setItem("condition", "textPositive");
	}
	else */if (rand < 0.5) {
		window.location.href = 'voiceJournal.html';
		sessionStorage.setItem("condition", "voiceNeutral");
	}
	
	else {
		window.location.href = 'voiceJournalP.html';
		sessionStorage.setItem("condition", "voicePositive");
	}
	// then record the journal start time here, in ms from 
	sessionStorage.setItem("journalStartTime", Date.now());
}

// returns the journal text for the user to view
function getJournalText() {
	document.getElementById('journal_text').innerHTML = sessionStorage.getItem("journalText");
}

// get the value of journal text from the text journal page and store it, then navigate to the next page
function setJournalText() {
	// then record the journal end time here
	sessionStorage.setItem("journalEndTime", Date.now());
	str = document.getElementById('journalText').value;
	if (str.length > 20) {
		sessionStorage.setItem("journalText", str);
		navToReflection();
	}
}

// function to navigate to the reflection page
function navToReflection() {
	window.location.href = 'readJournal.html';
	// then record the time to see when the user started reading (approx)
	sessionStorage.setItem('readingStartTime', Date.now());
}

// store the information we get from the initial questionnaire
function storeDemoInfo() {
	try {
		sessionStorage.setItem("gender", document.querySelector('input[name="gender"]:checked').value);
		sessionStorage.setItem("age", document.getElementById('age').value);
		sessionStorage.setItem("compUsage", document.querySelector('input[name="compusage"]:checked').value);
		sessionStorage.setItem("journalUsage", document.querySelector('input[name="journalusage"]:checked').value);
		sessionStorage.setItem("initialMood", document.querySelector('input[name="initialMood"]:checked').value);
		getLink();
	}
	catch (e) {
		document.getElementById('error').innerHTML = 'Please answer all questions.';
	}
}

// store the information we get from the ending questionnaire
function storeEndAnswers() {
	sessionStorage.setItem('likelihood', document.querySelector('input[name="future"]:checked').value);
}

// go to the last page
function navToEndQuestions() {
	// record time to get reading end time
	sessionStorage.setItem("readingEndTime", Date.now());
	window.location.href = 'postJournal.html';
}

// record all data at the end
function recordAllData() {
	let studyEndTime = Date.now();
	let likelihood = document.querySelector('input[name="future"]:checked').value;
	let helpfulj = document.querySelector('input[name="helpfulj"]:checked').value;
	let helpfulr = document.querySelector('input[name="helpfulr"]:checked').value;
	let endMood = document.querySelector('input[name="endMood"]:checked').value;
	let feedback = document.getElementById('feedback').value;
	let studyStartTime = sessionStorage.getItem('studyStartTime');
	let gender = sessionStorage.getItem('gender');
	let age = sessionStorage.getItem('age');
	let compUsage = sessionStorage.getItem('compUsage');
	let journalUsage = sessionStorage.getItem('journalUsage');
	let initialMood = sessionStorage.getItem('initialMood');
	let condition = sessionStorage.getItem('condition');
	let journalStartTime = sessionStorage.getItem('journalStartTime');
	let journalEndTime = sessionStorage.getItem('journalEndTime');
	let journalText = sessionStorage.getItem('journalText');
	let readingStartTime = sessionStorage.getItem('readingStartTime');
	let readingEndTime = sessionStorage.getItem('readingEndTime');
	// I think to do this I just call the Google Sheets url with the parameters all in the right place. Use & to separate params
	let url = 'https://script.google.com/macros/s/AKfycbxClv8WL8CKr6_FdTmyHdolGgKk6-YU8w9OYDJM-zEUDv27xDcs/exec?studyStartTime=' + studyStartTime + 
	'&gender=' + gender + '&age=' + age + '&compUsage=' + compUsage + '&journalUsage=' + journalUsage + '&initialMood=' + initialMood + '&condition=' + condition
	+ '&journalStartTime=' + journalStartTime + '&journalEndTime=' + journalEndTime + '&journalText=' + journalText + '&readingStartTime=' + readingStartTime
	+ '&readingEndTime=' + readingEndTime + '&likelihood=' + likelihood + '&helpfulj=' + helpfulj + '&helpfulr=' + helpfulr + '&endMood=' + endMood + '&feedback=' 
	+ feedback + '&studyEndTime=' + studyEndTime;
	http.open('GET', url, true);
	http.send();
	http.onreadystatechange = processRequest;
}

function processRequest(e) {
	if (http.readyState == 4 && http.status == 200) {
		var response = JSON.parse(http.responseText);
		console.log(response);
		let currentLocation = window.location.href;
		console.log(currentLocation);
		//if (currentLocation.includes('postJournal.html')) {
		if (response.result == 'success') {
			window.location.href = 'journalEnd.html';
		}
		else {
			document.getElementById('error').innerHTML = 'An error was encountered when trying to submit your data. Please try again by repressing the Submit button.'
		}
		//}
//		else {
//			let row = response.row;
//			// because the first call always adds an extra row, it should be that every 4 is text. so row 2 is extra, row 3 is text, row 4 is extra, row 5 is text
//			if (row % 4 == 1) {
//				window.location.href = 'textJournal.html';
//				sessionStorage.setItem('condition', 'text');
//			}
//			else {
//				window.location.href = 'voiceJournal.html';
//				sessionStorage.setItem('condition', 'voice');
//			}
//			sessionStorage.setItem('journalStartTime', Date.now());
//		}
	}
}

function navToEndPage() {
	window.location.href = 'journalEnd.html';
}

// record start time of the study
function recordStartTime() {
	sessionStorage.setItem('studyStartTime', Date.now());
}
