/**
 * Strings, lesson 1.6
 * @author Mike Whitfield
 * 
 * In this module, I synthesize our knowledge of strings, assignment, and 
 * arithmetic.
 * 
 */

var secretString = 'this is a secret string.';
var numberOfRotations = [];
var encryptedString = '';
for (let position in secretString) {
    numberOfRotations.push(Math.floor(Math.pow(secretString.charCodeAt(position) - 31, 
        2) / (126 - 31)));
    encryptedString += String.fromCharCode((Math.pow(secretString.charCodeAt(position) - 31, 2) % (126 - 31)) + 31);
}
var decryptedString = '';
let char;
for (let encryptedPosition in encryptedString) {
    char = encryptedString.charCodeAt(encryptedPosition);
    char = Math.sqrt((char - 31)  + (126 - 31) * numberOfRotations[encryptedPosition]) + 31;
    decryptedString += String.fromCharCode(char);
}

module.exports.nowYouTry = function() {
    // you should try running the above functions to verify them on strings
    // you create.
};
// uncomment the following line and run "node ./1.6-strings_as_numbers.js"
// module.exports.nowYouTry();