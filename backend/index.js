const express=require('express');
const cors = require('cors');
const { tryCatch } = require('bullmq');
const app = express();
const Queue = require('bull');

const myQueue = new Queue('my-queue', 'redis://127.0.0.1:6379');



app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 

const PORT=3000;
app.listen(PORT,()=>{
    console.log('App listening on port',PORT);
})

app.get("/",(req ,res)=>{
    res.send("Hello from server");
    
})

app.post("/name" ,(req,res)=>{
    try {
        
        console.log(req.body.name);
        res.send({name:req.body.name});
    } catch (error) {
        console.log(error);
    }
});





myQueue.process(async (job) => {
    console.log('Processing job', job.id);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    return `Hello, ${job.data.name}!`;
});

app.post("/process-name", async (req, res) => {
    try {
        const job = await myQueue.add({ name: req.body.name });
        res.json({ jobId: job.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/job-status/:jobId", async (req, res) => {
    const job = await myQueue.getJob(req.params.jobId);
    if (job) {
        const state = await job.getState();
        const result = job.returnvalue;
        res.json({ id: job.id, state: state, result: result });
    } else {
        res.status(404).json({ error: 'Job not found' });
    }
});