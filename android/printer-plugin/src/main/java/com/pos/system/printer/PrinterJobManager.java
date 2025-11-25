package com.pos.system.printer;

import android.util.Log;

import java.util.LinkedList;
import java.util.Queue;

class PrinterJobManager {
    static class Job {
        String type; // escpos, zpl, pdf
        String payload; // base64 or text depending on type
        String host; // for network
        int port; // for network
    }

    private final Queue<Job> queue = new LinkedList<>();
    private boolean processing = false;

    synchronized void enqueue(Job job) {
        queue.add(job);
        if (!processing) {
            processNext();
        }
    }

    private void processNext() {
        Job job = queue.poll();
        if (job == null) {
            processing = false;
            return;
        }
        processing = true;
        // Placeholder: jobs are handled by plugin methods directly for now.
        Log.d("PrinterJobManager", "Processing job: " + job.type);
        // Immediately mark as done; real implementation would call into printer APIs
        processing = false;
        if (!queue.isEmpty()) processNext();
    }
}

