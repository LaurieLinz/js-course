/**
 * Strings, lesson 1.5
 * @author Mike Whitfield
 * 
 * In this module, we'll examine strings.  We'll look at some common string
 * methods.  It's really important for you to understand string functions and
 * you'll get a lot of opportunity to practice string functions over the first
 * half of this course.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 * 
 */

var concatenatedString = 'abc' + 'def'; // 'abcdef'
var hamlet = "That can I; At least, the whisper goes so. Our last king, Whose image even but now appear'd to us, Was, as you know, by Fortinbras of Norway, Thereto prick'd on by a most emulate pride, Dared to the combat; in which our valiant Hamlet-- For so this side of our known world esteem'd him-- Did slay this Fortinbras; who by a seal'd compact, Well ratified by law and heraldry, Did forfeit, with his life, all those his lands Which he stood seized of, to the conqueror: Against the which, a moiety competent Was gaged by our king; which had return'd To the inheritance of Fortinbras, Had he been vanquisher; as, by the same covenant, And carriage of the article design'd, His fell to Hamlet. Now, sir, young Fortinbras, Of unimproved mettle hot and full, Hath in the skirts of Norway here and there Shark'd up a list of lawless resolutes, For food and diet, to some enterprise That hath a stomach in't; which is no other-- As it doth well appear unto our state-- But to recover of us, by strong hand And terms compulsatory, those foresaid lands So by his father lost: and this, I take it, Is the main motive of our preparations, The source of this our watch and the chief head Of this post-haste and romage in the land.";

hamlet.indexOf('can'); // 5
hamlet.indexOf('that'); // -1
hamlet.toLowerCase().indexOf('that');
hamlet.replace('king', 'queen');
hamlet.replace('he', 'she'); // oops!  replaces "the" as well.
hamlet.replace(' he ', ' she '); // preserve spaces for both cases

var alphabet = 'abcdefghijklmnopqrstuvwxyz';
alphabet.substr(0, 2); // 'ab'
alphabet.substr(2); // 'cdefghijklmnopqrstuvwxyz'
alphabet.substr(-2); // 'yz'

var animal = 'cat';
var object = 'moon';
var adlib = `the ${animal} jumps over the ${object}` // this is a template literal

module.exports.nowYouTry = function() {
    // let's redo to the adlib variable assignment from 1.3, except now
    // you should code the adlib function using a replacement method and 
    // a template literal method

    adlib_concatenation = function(animal, action, preposition, place) {
        // TODO: add in the parameters to this function to complete the adlib.
        return 'the ' + ' ' + '.';
    }

    adlib_replace = function(animal, action, preposition, place) {
        var adlib = 'the ANIMAL ACTION PREPOSITION PLACE';
        adlib = adlib.replace('ANIMAL', animal);
        // TODO: do the rest of the replacements.
        return adlib;
    }

    adlib_template = function(animal, action, preposition, place) {
        // TODO: add in the parameters to this function to complete the adlib.
        return `the ${animal} .`
    }

    // set animal = 'horse'
    // set place = 'barn'
    // set preposition = 'over'
    // set action = 'jumped'
    console.log(adlib_concatenation(animal, action, preposition, place));

    // set animal = 'cat'
    // set place = 'house'
    // set preposition = 'in'
    // set action = 'meowed'
    console.log(adlib_replace(animal, action, preposition, place));

    // set animal = 'ant'
    // set place = 'hill'
    // set preposition = 'up'
    // set action = 'marched'
    console.log(adlib_template(animal, action, preposition, place));
}
// uncomment the following line and run "node ./1.5-strings.js"
// module.exports.nowYouTry();