const port = 3333;

const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');



// set up job
var job = new CronJob(
    '0 * * * *', 
    triggerVideo,
    null, 
    true, 
    'America/Los_Angeles'
);

// stop job on server restart
job.stop();

app.post('/start', (req, res) => {
    job.start()

    var response = {
        error: false
    }

    triggerVideo();

    res.send(JSON.stringify(response))
})

app.post('/stop', (req, res) => {
    job.stop()

    var response = {
        error: false
    }

    res.send(JSON.stringify(response))
})

app.post("/status", (req,res)=>{
    var running = job.running;

    var response = {
        error: false,
        data : {
            running
        }
    }

    res.send(JSON.stringify(response))
})

app.post("/videos", (req,res)=>{
    const root = "public/videos";
    const json = dirTree(root);

    res.send(json);
})

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`ODS server running on port ${port}`);
});

function triggerVideo(){
    var minutes = 60 - new Date().getMinutes();
    minutes = 0 ? 60 : minutes;

    var seconds = (minutes * 60);

    console.log("RUN", `sh /home/pi/FBI/ods-local-server-test/scripts/takevideo.sh ${seconds}`)

    const script =  exec(`sh /home/pi/FBI/ods-local-server-test/scripts/takevideo.sh ${seconds}`, { shell:true });

    if(script.error){
        console.error("triggerVideo_ScriptError", script.error);
    }

    if(script.error == null){
        script.stdout.on('data', (data)=>{
            console.log("STDOUT", data);
        });
        script.stderr.on('data', (data)=>{

            if(data.startsWith("TAKEVIDEO")){
                console.error("STDERR", data);
            }

            if(data.includes("Device or resource busy")){
                setTimeout(function(){
                    if(job.running){
                        triggerVideo();
                    }
                }, 1000)
            }
        });
    }
}

function dirTree(filename){
    const stats = fs.lstatSync(filename);
    const info = {
        path: filename,
        name: path.basename(filename)
    }

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        info.type = "file";
    }

    return info;
}