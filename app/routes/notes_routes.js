const vision = require('@google-cloud/vision');
var shell = require('shelljs'); 
const speech = require('@google-cloud/speech');
const storage = require('@google-cloud/storage');
//Begin New Code - RS
const querystring = require('querystring');
//End New Code - RS 
// Creates a client
const client = new vision.ImageAnnotatorClient({
	keyFileName: './LAHacks2018-47f0eddadfcd.json'
});

var fs = require('fs');


module.exports = function(app, db){
	app.post('/test', (req, res) => {
		var hello = "hey there. my name is bob. I like to dance and sleep. I'm the only bob that can do both. To win, say Good Day Bobber!";
		textSummary(hello, function textSummaryCb(summary){res.send(summary);})
			// .then(summary => {
			// 	res.send(summary);
			// });
		//console.log(temp, "this is temp");
		//res.send(temp);
	});
	app.post('/ocr', (req, res) => {
		//Begin New Code - RS
		//Parse the actual JSON Request
			//Depends on having the querystring module installed
			var body = '';
			var post = ''; 
			req.on('data', function (data) {
				body += data;
				request.on('end', function () {
				    post = querystring.parse(body);
				})
			});

		var firebaseLink1 = post.Picture1;
		var firebaseLink2 = post.Picture2;
		var firebaseLink3 = post.Picture3;
		//Parse the firebase Links
		shell.exec('curl' + ' ' + firebaseLink1).to('test.jpg');
		shell.exec('curl' + ' ' + firebaseLink2).to('test2.jpg');
		shell.exec('curl' + ' ' + firebaseLink3).to('test3.jpg');
		//Test[1-3].jpg now has the proper image. Provided we can extract the proper firebase links from the JSON Req. 

		//End New Code - RS
		const file = './test.jpg';
		const file2 = './test2.jpg';
		const file3 = './test3.jpg';
		var p1 = detectText(file);
		var p2 = detectText(file2);
		var p3 = detectText(file3);
		var fin = p1 + p2 + p3;
		//const file = './test.p'; //set test.png file
		res.send(fin);
	});
	app.post('/s2t', (req, res) =>{
		//Begin New Code - RS 
		//get firebase link which is in .m4a and conver with ffmpeg to .wav and push that to google cloud in a bucket
		var body = '';
		var post = '';

		req.on('data', function (data) {
			body += data;
			req.on('end', function () {
				post = querystring.parse(body);
			})
		}); 
		var firebaseLink = 'https://firebasestorage.googleapis.com/v0/b/lahacks2018-db3be.appspot.com/o/ProfLec.m4a?alt=media&token=83ca7bca-cbb2-4941-9e2b-8b5ce3561f5f';
		//shell.exec('curl'+ ' ' + firebaseLink).to('test.m4a');
		shell.exec('ffmpeg -i 10SecondAd.m4a -ac 1 -f wav fileout.wav');
		shell.exec('gsutil cp fileout.wav gs://single-kingdom-177819.appspot.com');
		//End New Code - RS 
		//Still need to install the shelljs framework. Then this will work. 
		//the fileout.wav file has now been updated to firebase. 
		const afile = 'gs://single-kingdom-177819.appspot.com/fileout.wav'; //need URI for the bucket
		audio2Text(afile) //transcript (type string) is on Google Storage or on Firebase as a URL
			.then(transcription => {
				textSummary(transcription, function textSummaryCb(summary){
					keyWordAnalyzer(transcription, 
						function textKeywordsCb(keywords){
							res.send({
								keywords, summary
							});
						});
				});
				
				//textSummary(transcription, function textSummaryCb(summary){res.send(summary);})
				//keyWordAnalyzer(transcription, function textKeywordsCb(keywords){res.send(keywords);});
				/*fs.writeFile('transcription.txt', transcription, 'utf8', function(err){
					if(err){
						console.log(err);
					}
					else{
						shell.exec('gsutil cp transcription.txt gs://single-kingdom-177819.appspot.com');
						var whole = transcription.toString()
						textSummary(whole)
							.then(summary => {
								res.send(summary);
							});
					}
				});	
				*/
			});

		/*
		var obj;
		keyWords()
			.then(keywords => {
				obj = ({ transcription: transcript, key_words: keywords});
			})
		var json = JSON.stringify(obj);
		res.send(json);
		//res.send('');
		*/
	});
};

function detectText(fileName) {
	var res;
  client
    .textDetection(fileName)
    .then(results => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach(text => console.log(text));
      detections.forEach(text => res += text);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
    return res;
  // [END vision_text_detection]
};

function audio2Text(afile) { //return just transcript from JSON returned by Speech 2 Text API
	/*
	var fs = require('fs');
	var fileName = './request.json';
	
	var file = require(fileName);

	file.uri = afile; //bucket link (JSON serialization)

	fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err) {
 	 if (err) return console.log(err);
 	 console.log(JSON.stringify(file, null, 2));
 	 console.log('writing to ' + fileName);
	});

	return fileName.uri;
	*/
	var wav = require('node-wav');
	const client = new speech.SpeechClient();
	
	// The name of the audio file to transcribe
	//shell.exec('gsutil cp gs://single-kingdom-177819.appspot.com/fileout.wav ')
	const fileName = './fileout.wav'
 	//var s_r = content.header.sample_rate;
	// Reads a local audio file and converts it to base64
	const file = fs.readFileSync(fileName);
	let result = wav.decode(file);
	const audioBytes = file.toString('base64');
 
	// The audio file's encoding, sample rate in hertz, and BCP-47 language code
	const audio = {
  	content: audioBytes,
	};
	const config = {
 	 encoding: 'LINEAR16',
 	 sampleRateHertz: result.sampleRate,
 	 languageCode: 'en-US',
	};
	const request = {
  		audio: audio,
 	 	config: config,
	};

// Detects speech in the audio file
return client
  .recognize(request)
  .then(data => {
    const response = data[0];
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    return transcription;
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
  
/*
  	var fs = require('fs');
	var obj = ({config: {encoding: "LINEAR16", sample_rate: 16000, language_code: "en-US"}, audio: {uri: afile}});
	var json = JSON.stringify(obj);
	fs.writeFileSync('request.json', json);
	*/
	/*
	var file = fs.readFileSync('./request.json');
	var content = JSON.parse(file);
	content.uri = afile;
	fs.writeFileSync('./request.json', jsonData);
	//var request = require(fileName);

	//request.uri = afile;
	var fileName = './request.json';
	return fileName.uri;
	*/
	/*
	shell.exec('curl -s -X POST -H "Content-Type: application/json" --data-binary @request.json "https://speech.googleapis.com/v1beta1/speech:syncrecognize?key=AIzaSyCoQUSRNhBtiP8eTAdZZx5vx_zoGh4aEUY"').to('response.json');
	var fin = './response.json';
	var s = JSON.parse(fs.readFileSync(fin));
	//to-do: make the curl for 
	return s;
	*/
};

function textSummary(lstring, callback) {
	var unirest = require('unirest');
	//var data;
	unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer-text")
	.header("X-Mashape-Key", "eFbHyyBRwWmshflaCX6fKQMSHDkrp1Jj3Yujsnz6hGV4zzo6i8")
	.header("Content-Type", "application/x-www-form-urlencoded")
	.header("Accept", "application/json")
	.send("sentnum=3")
	.send("text="+lstring)
	.end(function (result) {
	//data = result.body;
  		console.log(result.status, result.headers, result.body);
  		callback(result.body);
  
});
};

function keyWordAnalyzer(transcription, callback){
	var vfile = require('to-vfile');
	var retext = require('retext');
	var keywords = require('retext-keywords');
	var nlcstToString = require('nlcst-to-string');
	var obj = {};
	retext()
	  .use(keywords)
	  .process(transcription, function (err, file) {
	    if (err) throw err;

	    console.log('Keywords:');
	    returnObject = {
	    	keywords: [],
	    	keyWordValues: []
	    };
	    file.data.keywords.forEach(function (keyword) {
	    	returnObject.keywords.push(nlcstToString(keyword.matches[0].node));
	      console.log(nlcstToString(keyword.matches[0].node));
	    });

	    console.log();
	    console.log('Key-phrases:');
	    
	    file.data.keyphrases.forEach(function (phrase) {
	    	returnObject.keyWordValues.push(phrase.matches[0].nodes.map(nlcstToString).join(''));
	      console.log(phrase.matches[0].nodes.map(nlcstToString).join(''));
	    });
	  });
	  	callback(returnObject);
};



