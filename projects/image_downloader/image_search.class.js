'use strict';
/**
 * 
 * @file
 * In this assignment, you need to author a function to perform an arbitrary
 * image search.  You'll be using the Flickr API with a predefined "key".
 * An API is a network endpoint (or URL) that usually returns JSON.  When a 
 * network endpoint returns JSON, it becomes easy to work with.
 * 
 * The trick with API's is that they don't always provide their data or 
 * "API endpoints" in the format you want.  In this assignment, you'll first
 * use the "search" endpoint which returns a list of photo ID's.  Rather than
 * making it easy, Flickr uses photo ID's internally.  You'll need to run the
 * "getSizes" endpoint to get information about the actual photo URL.
 * 
 * Why do websites do this?  Two answers: they protect their assets by making
 * core data obscure to get at, and at larger scales different teams are 
 * responsible for different parts of a system.  The latter circumstance results
 * that teams create internal mechanisms to communicate, and without good 
 * leadership, customers (in this case, you'll be an "API customer") are
 * forced to use sort through this organizational complexity as well.
 * 
 */
class ImageSearch {
    constructor() {
        this.network = require('request');
    }

    /**
     * Gets a photo given a keyword.
     * @param {string} keyword The keyword to search for.  
     * @param {Number} idx (Optional) The index of the results to store.
     * @returns {Promise} A promise that resolves with
     */
    getPhoto(keyword, idx) {
      if (!idx) { idx = 0 }
        return new Promise((resolve, reject) => {
            this.search(keyword).then((response) => {
                this.getFlickrPhoto(response.photos.photo[idx].id)
                    .then((contents) => {
                        this.storeFile(__dirname + '/photos/' + 
                            keyword + '.jpg', contents);
                        resolve();
                    });
            });
        });
    }
    
    /**
     * 
     */
    getPhotoInfo(id) {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Gets a photo file from a URL.  Requests the URL using a binary encoding
     * which is important.
     * @param {String} url The url from which to retrieve the photo.
     * @returns {Promise} A promise that reoslves with the photo file.
     */
    getPhotoFile(url) {
        return new Promise((resolve, reject) => {
                this.network({
                encoding: 'binary',
                url: url
            }, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    }

    /**
     * Gets the photo contents and returns the network response as a promise.
     * Takes an input of an ID.
     * @param {String} id The Flickr photo ID.
     * @return {Promise} A promise that resolves with the photo contents of the
     * ID.  You should collect the largest available photo.
     */
    getFlickrPhoto(id) {
        return new Promise((resolve, reject) => {
            this.network('https://api.flickr.com/services/rest?format=json' + 
                '&method=flickr.photos.getSizes&api_key=' + 
                'd103d9be76c00510e3738c283338125e&photo_id=' + id +
                '&nojsoncallback=1', (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            let url = JSON.parse(body)
                                .sizes.size.slice(-2)[0].source;
                            this.getPhotoFile(url).then(resolve).catch(reject);
                        } catch(e) {
                            console.log('Oh, that JSON is probably stank!', e);
                        }
                    }
                });
        });
    }

    /**
     * Searches photo, stores in database.
     * @param {string} keyword The keyword to search for.  
     * @param {Number} maxDate Timestamp passed into the max_upload_date 
     * parameter.
     * @returns {Promise} A promise that resolves with the last photo ID.
     */
    indexPhotos(keyword, maxDate) {
      if (!maxDate) {maxDate = -1}
        return new Promise((resolve, reject) => {
            this.search(keyword).then((response) => {
               let requests = 0;
               let responses = 0;
               for (let photo of response.photos.photo) {
                  requests++;
                  (function(photo) {
                     this.getFlickrPhoto(photo.id)
                        .then((contents) => {
                           responses++;
                           if (requests == responses) {
                              resolve(photo);  
                           }
                           this.storeInDB(keyword, photo.id, contents);
                        }).catch(() => {
                           responses++;
                           if (requests == responses) {
                              resolve(photo);  
                           }
                        });
                  }).bind(this)(photo);
               }
            });
        });
    }

    /**
     * This function should initiate the request and return a promise with the
     * image URL for the first result.  Note that you'll need to initiate two
     * requests to make this happen.
     * 
     * ex. 
     * https://api.flickr.com/services/rest
     *      format=json
     *      method=flickr.photos.search
     *      api_key=d103d9be76c00510e3738c283338125e
     *      text=waterfall
     *      nojsoncallback=1
     * 
     * https://www.flickr.com/services/api/flickr.photos.search.html
     * https://www.flickr.com/services/api/flickr.photos.getSizes.html
     * 
     * @param {String} keyword The keyword to search and pass to the Flickr API.
     * @return {Promise} A promise that resolves with the search listing of the
     * inputted keyword.
     */
    search(keyword) {
        return new Promise((resolve, reject) => {
            this.network('https://api.flickr.com/services/rest?format=json' + 
                '&method=flickr.photos.search&api_key=' + 
                'd103d9be76c00510e3738c283338125e&text=' + keyword +
                '&nojsoncallback=1', function(err, response, body) {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            resolve(JSON.parse(body));
                        } catch(e) {
                            console.log('Oh, that JSON is probably stank!', e);
                        }
                    }
                });
        });
    }

    /**
     * Stores the file in the filesystem.  Uses synchronous functions.  Saves
     * to a 'photos' directory.
     * @param {String} filename The filename to use.
     * @param {String} contents The contents of the file.
     */
    storeFile(filename, contents) {
        if (!require('fs').existsSync(__dirname + '/photos')) {
            require('fs').mkdirSync(__dirname + '/photos');
        }
        require('fs').writeFileSync(filename, 
            contents, 'binary');
    }
    
    /**
     * @param {String} keyword The keyword used for search.
     * @param {String} id The ID of the photo.
     * @param {BLOB} contents The photo contents.
     */
    storeInDB(keyword, id, contents) {
       require('request').post({
          url: 'http://development.lifebots.co/storeImage.php',
          formData: {
              img: {
                  value: (new Buffer(contents, 'utf8')).toString('utf8'),
                  options: {
                      contentType: 'image/jpeg'
                  }
              },
              id: id
          }
       }, function(err, res, body) {
        console.log(err);
       });
       require('request').post({
          url: 'http://development.lifebots.co/api.php/photos',
          body: {
             keyword: keyword,
             photo_id: id,
             contents: contents
          },
          json: true
       }, (err, res, body) => {
           if (err) {
               console.warn('An error occurred writing to photos', err);
           } else {
            console.log('Successfully indexed photo ' + id, body);
           }
       });
    }
}

module.exports = ImageSearch;   