'use strict';

/**
 * Created by tejzpr on 05/01/2017.
 */

const util = require('util');
const bayes = require('leveldb-naive-bayes');
const levelUp = require('level');
const Promise = require('bluebird');
const TreeBank = require('talisman/tokenizers/words/treebank');
const Frequencies = require('talisman/stats/frequencies');
const UEAStemmer = require('talisman/stemmers/uea-lite');
const TalkifyClassifier = require('talkify-classifier');


const db = levelUp("levelDB");
const options = {
    tokenize: function(str) {
        var tokens = TreeBank(str);
        var stems = [];
        tokens.map(function(token){
            stems.push(UEAStemmer(token));
        });
        return stems;
    },
    frequency: function(tokens) {
        return Frequencies.absolute(tokens);
    }
}

function NaiveBayesLevelDBClassifier(){
    const classifier = new bayes(db, options);
    const trainMe = function(topic, text){
        return new Promise(function(resolve, reject){
            try {
                classifier.train(topic, text, function () {
                    resolve();
                })
            } catch (e){
                reject();
            }
        })
    };

    this.trainDocument = function(trainingData, callback) {
        var trainings = [];
        if(trainingData instanceof Array) {
            for(var i = 0; i < trainingData.length; i++) {
                var topic = trainingData[i].topic;
                var text = trainingData[i].text;
                trainings.push(trainMe(topic, text));
            }
            return Promise.all(trainings)
                .then(function(){
                    return callback(undefined, true);
                })
                .catch(function(){
                    return callback(undefined, false);
                })
        }

        var topic = trainingData.topic;
        var text = trainingData.text;
        return trainMe(topic, text)
            .then(function(){
                return callback(undefined, true);
            })
            .catch(function(){
                return callback(undefined, false);
            });
    };

    this.getClassifications = function(question, callback) {
        var out = [{label: "", value: 0}];
        classifier.classify(question, function(err, category){
            if(err){
                return callback(undefined, out);
            }
            out = [{label: category.category, value: category.match/100}];
            return callback(undefined, out);
        });
    };

    this.initialize = function(callback) {
        return callback();
    }
}

util.inherits(NaiveBayesLevelDBClassifier, TalkifyClassifier);

module.exports = NaiveBayesLevelDBClassifier;