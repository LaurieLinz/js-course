var cheerio = require('cheerio');
var cheerioAdv = require('cheerio-advanced-selectors');
var document = require('fs')
    .readFileSync(__dirname + '/rebuild_dom.mock.html', 'utf8');
var $ = cheerio.load(document);
var rebuildNode = require(__dirname + '/../www/component.class.js').rebuildNode;

describe('Rebuild DOM function', () => {
    it('Should build a path on the DOM with no children.', () => {
        expect(cheerioAdv.find($, rebuildNode(document, 97)).text()).toBe('Hello World!');
    });
    it('Should ignore previous sibling tags.', () => {
        expect(cheerioAdv.find($, rebuildNode(document, 140)).text()).toBe('Hello USA!');
    });
    it('Should cull previous sibling tags with children.', () => {
        expect(cheerioAdv.find($, rebuildNode(document, 212)).text()).toBe('Hello Brazil!');
    });
    it('Should ignore tags that are self closing and HTML comments.', () => {
        expect(cheerioAdv.find($, rebuildNode(document, 350)).text()).toBe('Hello Russia!');
    });
    it('Should not care if element path has children.', () => {
        expect(cheerioAdv.find($, rebuildNode(document, 541)).text().trim()).toBe('Hello UK!');
    });
});