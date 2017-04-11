/**
 * This function should update a file of your choosing in your student 
 * folder.
 */
function updateFileInScheduler() {
    let fs = require('fs');
    fs.writeFileSync('default.txt', (new Date()).getTime());
    let d1 = (new Date(
        parseInt(fs.readFileSync('default.txt', 'UTF8'))));
    let d2 = (new Date());
    console.assert(Math.abs(d1.getTime() - d2.getTime()) < 5000);
}

/**
 * Kicks off bash script to perform commit on new changes.
 */
function kickOffAddCommitPushScript() {
    let cp = require('child_process');
    cp.execFileSync('./push.sh');
}

process.chdir(__dirname);

setInterval(() => {
    updateFileInScheduler();
    kickOffAddCommitPushScript();
}, 60000);