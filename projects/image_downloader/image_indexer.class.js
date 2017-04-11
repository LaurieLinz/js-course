'use strict';
class ImageIndexer {
   constructor() {
      this.timeout = 300;
      this.readNouns();
      this.imageSearch = new (require(__dirname + '/image_search.class.js'))();
      /** @type {String} The current keyword used in search. */
      this.currentKeyword = '';
      this.getPhotos();
   }
   
   /**
    * Gets the last status of the indexer.  Stores the value into a class 
    * member called this.lastStatus.
    * @returns {Promise} A promise that resolves when the last status has been
    * retrieved and the this.lastStatus variable has been updated. 
    */
   getLatestStatus() {
      // query database for the most recent status object
      return new Promise((resolve, reject) => {
          require('request')({
              url: 'http://development.lifebots.co/api.php/' +
                'photo_indexing_statuses?order=id,desc&page=1,10&key=b0tc0de'
          }, function(err, res, body) {
            try {
                body = JSON.parse(body);
            } catch(e) {}
            if (typeof body != 'object') {
                console.warn('Failed to coerce photo statuses to object');
                reject();
                return;
            }
            if (body['photo_indexing_statuses']['records'].length == 0) {
                this.lastStatus = null;
            } else {
                this.lastStatus = body['records'][0];
            }
            resolve();
          }.bind(this));
      });
   }
   
   /**
    * @returns {Promise} Promise that resolves when the next photo has been 
    * gotten.
    */
   getNextPhoto() {
      return new Promise((resolve, reject) => {
         this.getLatestStatus().then(() => {
             let idx = 0;
             if (this.lastStatus != null) {
                idx = this.nouns.indexOf(this.lastStatus.keyword);
             }
            if (idx == -1) {
               console.warn('Could not find the lastStatus keyword in this.nouns');
            }
            idx++;
            try {
               this.currentKeyword = this.nouns[idx];
               this.imageSearch.indexPhotos(this.currentKeyword).then(resolve);
            } catch(e) {
               console.warn('Could not iterate onto next keyword.');
               reject();
            }
         });
      });
   }
   
   /**
    * Gets next photo, and when network call resolves, gets the next photo.
    * Runs indefinitely until an error has occurred.
    */
   getPhotos() {
      this.getNextPhoto().then((lastPhoto) => {
         this.imageSearch.getPhotoInfo(lastPhoto.id).then((json) => {
            try {
               this.writeStatus(this.currentKeyword, json.photo.dateuploaded)
                  .then(() => {
                     setTimeout(this.getPhotos, this.timeout);
                  });
            } catch(e) {
               console.warn('Failed to obtain the date uploaded for last ' + 
                  'photo batch.', lastPhoto.id, json.photo);
            }
         });
      });
   }
   
   /**
    * @returns {Array} An array of nouns to be indexed.
    */
   readNouns() {
      this.nouns = (require(__dirname + '/nouns.js'))['nouns'];
      return this.nouns;
   }
   
   /**
    * Writes the current status of the index.
    */
   writeStatus(keyword, dateUploaded) {
      // push status to server
       require('request').post({
          url: 'http://development.lifebots.co/api.php/photo_indexing_statuses',
          body: {
             keyword: keyword,
             last_photo_upload: dateUploaded,
             timestamp: (new Date()).getTime()
          }
       }, function(err, res, body) {
           if (err) {
                console.warn('An error occurred writing to photo_' + 
                    'indexing_statuses', err);
           } else {
                console.log('Successfully stored photo_indexing_statuses',
                    keyword, body);
           }
       });
   }
}

module.exports = ImageIndexer;