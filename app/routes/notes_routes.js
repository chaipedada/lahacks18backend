const vision = require('@google-cloud/vision');
var shell = require('shelljs'); 
//Begin New Code - RS
const querystring = require('querystring');
//End New Code - RS 
// Creates a client
const client = new vision.ImageAnnotatorClient({
	keyFileName: './LAHacks2018-47f0eddadfcd.json'
});



module.exports = function(app, db){
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
		var firebaseLink = 'https://firebasestorage.googleapis.com/v0/b/lahacks2018-db3be.appspot.com/o/ProfLec.m4a?alt=media&token=70cab01e-f206-4633-8f2c-b9380a63d80a';
		shell.exec('curl'+ ' ' + firebaseLink).to('test.m4a');
		shell.exec('ffmpeg -i ' + 'test.m4a -f wav fileout.wav');
		shell.exec('gsutil cp fileout.wav gs://single-kingdom-177810.appspot.com');
		//End New Code - RS 
		//Still need to install the shelljs framework. Then this will work. 
		//the fileout.wav file has now been updated to firebase. 
		const afile = 'gs://single-kingdom-177810.appspot.com/fileout.wav'; //need URI for the bucket
		var s = audio2Text(afile); //transcript (type string) is on Google Storage or on Firebase as a URL
		var data = textSummary();
		res.send(s);
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
	var fs = require('fs');
	var fileName = './request.json';
	var file = require(fileName);

	file.uri = afile; //bucket link (JSON serialization)

	fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err) {
 	 if (err) return console.log(err);
 	 console.log(JSON.stringify(file, null, 2));
 	 console.log('writing to ' + fileName);
	});
	shell.exec('curl -s -X POST -H "Content-Typxe: application/json" --data-binary @request.json \
"https://speech.googleapis.com/v1beta1/speech:syncrecognize?key=${AIzaSyCNggiY48UHEm_nHsJD4vUcarNd1dy2ZiY}"').to('response.json');
	var fin = './response.json';
	var s = fin.transcript
	//to-do: make the curl for 
	return s;
};

function textSummary() {
	var unirest = require('unirest');
	var data;
	unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer")
	.header("X-Mashape-Key", "eFbHyyBRwWmshflaCX6fKQMSHDkrp1Jj3Yujsnz6hGV4zzo6i8")
	.header("Content-Type", "application/json")
	.header("Accept", "application/json")
	.send({"url":"http://en.wikipedia.org/wiki/Automatic_summarization","text":"","sentnum":8}) //change URL to google storage url
	.end(function (result) {
		data = result.body;
  		console.log(result.status, result.headers, result.body);
	});
	return data;
};

function keyWorkAnalyzer(data){


};




