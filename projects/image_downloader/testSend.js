var jpg = require('fs').readFileSync('test.jpg');
require('request').post({
    url: 'http://localhost/storeImage.php',
    formData: {
        img: {
            value: jpg,
            options: {
                contentType: 'image/jpeg'
            }
        },
        id: 1234
    }
}, function(err, res, body) {
    console.log(body);
    console.log(err);
});