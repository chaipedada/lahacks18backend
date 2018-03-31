// [START vision_text_detection]
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

const fileName = '/chaitanyapedada/Desktop/test.png';

function detectText(fileName) {
  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs text detection on the local file
  client
    .textDetection(fileName)
    .then(results => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach(text => console.log(text));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_text_detection]
}

/*
exports.textDetector = (event) => {
  let file = event.data;

  return Promise.resolve()
    .then(() => {
      if (file.resourceState === 'not_exists') {
        // This was a deletion event, we don't want to process this
        return;
      }

      if (!file.bucket) {
        throw new Error('Bucket not provided. Make sure you have a "bucket" property in your request');
      }
      if (!file.name) {
        throw new Error('Filename not provided. Make sure you have a "name" property in your request');
      }

      return detectText(file.name);
    })
    .then(() => {
      console.log(`File ${file.name} processed.`);
    });
}
// [START vision_text_detection]
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

function detectText(fileName) {
*.

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';
/*
  // Performs text detection on the local file
  client
    .textDetection(fileName)
    .then(results => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach(text => console.log(text));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_text_detection]
}
*/