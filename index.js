#!/usr/bin/env node
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Defining Cache Settings
const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_DURATION_MS = 30 * 60 * 1000;   // 30 min

const userName = process.argv[2];

if(!userName) {
    console.log('Usage: github-activity <username>');
    process.exit(1);
}

function getCachedData(username) {
    /**
     * Tries to get fresh cached data for a user.
     * Returns parsed JSON data if found and fresh, otherwise null.
    */
    const cacheFilePath = path.join(CACHE_DIR, `${username}.json`);

    try {
        // Check if file exists
        if(!fs.existsSync(cacheFilePath)) {
            return null;
        }

        // Check if file is expired.
        const stats = fs.statSync(cacheFilePath);
        const fileAgeMs = Date.now() - stats.mtime.getTime()
        if(fileAgeMs > CACHE_DURATION_MS) {
            console.log('Cache is Stale');
            return null;
        }

        // Read and Parse the file
        console.log('Using Cached Data');
        const data = fs.readFileSync(cacheFilePath, "utf-8");
        return JSON.parse(data);

    } catch (error) {
        console.error('Error reading cache: ', error);
        return null;
    }
}

function setCache(username, data) {
    /**
    * Writes data to the cache for a specific user.
    */

    const cacheFilePath = path.join(CACHE_DIR, `${username}.json`);

    try {
        // Ensure the cache directory exists
        fs.mkdirSync(CACHE_DIR, { recursive: true });

        // Write the file
        fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2));
        console.log('Cache Saved!');
    } catch (error) {
        console.error('Error writing to cache: ', error.message);
    }
}

function displayActivity(events) {
    try {
        if(!events || events.length === 0) {
             console.log('No recent activity found.');
             return;
        }

        if (events.message) {
            console.error('Error fetching data:', events.message);
            return;
        }

        events.forEach(event => {
            let repoName; // Define repoName outside the switch for broader use
            switch(event.type) {
                
                case 'PushEvent':
                    repoName = event.repo.name;
                    
                    // Check if the commits array exists first
                    const commits = event.payload.commits;
                    if (commits && commits.length > 0) {
                        const commitsLength = commits.length;
                        console.log(`- Pushed ${commitsLength} commit(s) to ${repoName}`);
                    } else {
                        // This handles pushes with no commits (e.g., new branches)
                        console.log(`- Pushed to ${repoName}`);
                    }
                    
                    break; 

                case 'IssuesEvent':
                    repoName = event.repo.name;
                    const action = event.payload.action; //open or close
                    const issueTitle = event.payload.issue.title;
                    console.log(`- ${action} issue '${issueTitle}' in ${repoName}`);
                    break;
                    
                case 'WatchEvent':
                    repoName = event.repo.name;
                    console.log(`- Starred repo ${repoName}`);
                    break;
                
                case 'CreateEvent':
                    const refType = event.payload.ref_type;
                    repoName = event.repo.name;
                    if (refType === 'repository') {
                        console.log(`- Created new repository ${repoName}`);
                    } else if (refType === 'branch') {
                        console.log(`- Created new branch in ${repoName}`);
                    }
                    break; 
            }
        });
    } catch (error) {
        console.error("Error displaying activity:", error.message); 
    }
}

function main() {
    // Try to get data from cache
    const cachedData = getCachedData(userName);

    if(cachedData) {
        // If cache is valid, display it
        console.log('--- Activity (from cache) ---');
        displayActivity(cachedData);
        return ;
    }

    // If cache is empty or stale, fetch from API.
    console.log(`Fetching new data for ${userName}`);
    
    // create request options
    const options = {
        hostname: "api.github.com",
        path: `/users/${userName}/events`,
        method: 'GET',
        headers: {
            'User-Agent': 'node.js-github-activity-app'
        }
    }

    // Make API Request
    https.get(options, (res) => {
        const status = res.statusCode;
        if(status === 404) {
            console.error('User not found!')
            return; // <-- FIX: Added return
        } else if(status !== 200) {
            console.error('Error fetching data: ', res.statusMessage);
            return;
        }

        // Assemble data chunks
        let rawData = ''
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
            try {
                const freshData = JSON.parse(rawData);
                setCache(userName, freshData); // Save the new data
                displayActivity(freshData); // Display the new data
            } catch (error) {
                console.error("Failed to parse API response:", error.message);
            }
        })
    })
    .on('error', (err) => (console.error('Error making API Request: ', err.message)));
}

main();