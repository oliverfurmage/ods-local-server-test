const port = 3333;

const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;
const spawn = require('child_process').spawn;

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

app.post("/status", (req, res) => {
    var running = job.running;

    var response = {
        error: false,
        data: {
            running
        }
    }

    res.send(JSON.stringify(response))
})

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`ODS server running on port ${port}`);
});

function triggerVideo() {
    var minutes = 60 - new Date().getMinutes();
    minutes = 0 ? 60 : minutes;

    var seconds = (minutes * 60) - 120; // minus 2 mins seconds to allow for next script to run

    console.log("RUN", `sh /home/pi/FBI/scripts/takevideo_ollie.sh ${seconds}`)

    const ls = spawn(`sh /home/pi/FBI/scripts/takevideo_ollie.sh ${seconds}`)

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}