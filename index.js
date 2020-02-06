const port = 3333;

const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;
var exec = require('child_process').exec, child;

// set up job
var job = new CronJob(
    '*/3 * * * * *', 
    takePhoto,
    null, 
    true, 
    'America/Los_Angeles'
);

// stop job on server restart
job.stop();

app.get('/start', (req, res) => {
    job.start()
    res.send('Started!')
})

app.get('/stop', (req, res) => {
    job.stop()
    res.send('Stopped!')
})

app.get("/status", (req,res)=>{
    var response = job.running;
    res.send({response});
})

app.listen(port, () => console.log(`ODS server running on port ${port}`))

function takePhoto(){
    const script = exec('sh /home/pi/FBI/scripts/takesinglephoto.sh')

    script.stdout.on('data', (data)=>{
        console.log(data);
    });
    script.stderr.on('data', (data)=>{
        console.error(data);
    });
}