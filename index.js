const port = 3333;

const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;
var exec = require('child_process').exec, child;

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

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`ODS server running on port ${port}`);
});

function triggerVideo(){

    var seconds = 60 - new Date().getMinutes();
    
    if(seconds == 0){
        seconds = 60;
    }

    console.log("RUN", `sh /home/pi/FBI/scripts/takevideo_ollie.sh ${seconds}`)

    const script = exec(`sh /home/pi/FBI/scripts/takevideo_ollie.sh ${seconds}`);

    if(script.error){
        console.error("triggerVideo_ScriptError", script.error);
    }

    if(script.error == null){
        script.stdout.on('data', (data)=>{
            console.log("STDOUT", data);
        });
        script.stderr.on('data', (data)=>{
            console.error("STDERR", data);
        });
    }
}