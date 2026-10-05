const express = require('express');
const router = express.Router();
const os = require('os');

router.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  
  const metrics = [
    `# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.`,
    `# TYPE process_cpu_seconds_total counter`,
    `process_cpu_seconds_total ${process.cpuUsage().user / 1000000}`,
    ``,
    `# HELP process_resident_memory_bytes Resident memory size in bytes.`,
    `# TYPE process_resident_memory_bytes gauge`,
    `process_resident_memory_bytes ${process.memoryUsage().rss}`,
    ``,
    `# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.`,
    `# TYPE nodejs_heap_size_total_bytes gauge`,
    `nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}`,
    ``,
    `# HELP system_free_memory_bytes System free memory in bytes.`,
    `# TYPE system_free_memory_bytes gauge`,
    `system_free_memory_bytes ${os.freemem()}`,
    ``
  ];

  res.send(metrics.join('\\n'));
});

module.exports = router;
