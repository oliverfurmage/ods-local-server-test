const express = require('express')
const app = express()
const port = 3000

var CronJob = require('cron').CronJob;

let count = 1;

var job = new CronJob(
    '* * * * * *', 
    function() {
        console.log(count);
        count++;
    },
    null, 
    true, 
    'America/Los_Angeles'
);

app.get('/start', (req, res) => {
    job.start()
    res.send('Started!')
})

app.get('/stop', (req, res) => {
    job.stop()
    count = 1;
    res.send('Stopped!')
})

app.get("/status", (req,res)=>{
    var response = job.running;
    res.send({response});
})

app.listen(port, () => console.log(`ODS server running on port ${port}`))