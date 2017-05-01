# LevelDB Bayes Talkify Classifier
LevelDB based Bayes NLP Classifier implementation for Talkify

# Usage

Install the LevelDB Bayes Talkify Classifier:

```shell
npm install --save talkify-leveldb-bayes-classifier
```

Once installed, you can create a new object instance of the classifier like so:

```javascript
var LBNClassifier = require('talkify-leveldb-bayes-classifier');

var myClassifier = new LBNClassifier();
```

Pass the `myClassifier` object into the Talkify Bot.

```javascript
var options = {
                classifier: myClassifier
              };
var bot = new Bot(options);
```

