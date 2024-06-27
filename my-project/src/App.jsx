import React, { useState } from 'react';
import axios from 'axios';
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [jobs, setJobs] = useState([]);

  const sendToServer = async () => {
    try {
      const response = await axios.post('http://localhost:3000/process-name', { name: name });
      const jobId = response.data.jobId;
      const newJob = { jobId, status: 'pending', greeting: '' };
      setJobs(prevJobs => [...prevJobs, newJob]);
      checkJobStatus(jobId, newJob);
    } catch (error) {
      console.error("Error sending to server:", error);
    }
  };

  const checkJobStatus = async (jobId, job) => {
    try {
      const response = await axios.get(`http://localhost:3000/job-status/${jobId}`);
      const jobStatus = response.data.state;
      const jobResult = response.data.result;

      const updatedJob = { ...job, status: jobStatus, greeting: jobStatus === 'completed' ? jobResult : job.greeting };

      setJobs(prevJobs =>
        prevJobs.map(j => (j.jobId === jobId ? updatedJob : j))
      );

      if (jobStatus !== 'completed' && jobStatus !== 'failed') {
        setTimeout(() => checkJobStatus(jobId, updatedJob), 500); // Check again after 500ms
      }
    } catch (error) {
      console.error("Error checking job status:", error);
    }
  };

  return (
    <>
      <div className="heading">BULL MQ STIMULATION</div>
      <div>What's your name?</div>
      <textarea
        onChange={(e) => { setName(e.target.value); }}
        value={name}
      />
      <button onClick={sendToServer}>Click to initiate a job</button>

      {jobs.map((job, index) => (
        <div key={index}>
          <div>Job ID: {job.jobId}</div>
          <div>Job Status: {job.status}</div>
          {job.greeting && <div>Greet: {job.greeting}</div>}
        </div>
      ))}
    </>
  );
}

export default App;
