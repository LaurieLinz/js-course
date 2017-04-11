/**
 * YouTube Downloader is a popular NPM that allows YouTube videos to be 
 * downloaded as MP4 files.  In this assignment, you'll rig a server that 
 * allows any YouTube ID to be downloaded.  Furthermore, you'll author a 
 * frontend that allows you to batch in multiple ID's and you'll allow
 * batch processing on the server.  As each video is downloaded, you'll 
 * signal a success and add a check mark icon next to the batched video.
 */
let server = require(__dirname + '/../server.class.js');
class YTDL extends server {
    constructor() {
        this.ytdl = require('ytdl-core');
    }
}