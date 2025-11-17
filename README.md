# GitHub Activity CLI

A simple, zero-dependency Node.js command-line tool to fetch and display the recent public activity of a GitHub user, with built-in caching.

## Description

This tool provides a quick way to check a user's recent public events (pushes, stars, issues, etc.) directly from your terminal. It uses the official GitHub API and includes a 30-minute file-based cache to reduce API calls and speed up repeated lookups.

This project was built entirely with built-in Node.js modules (https, fs, path) and uses no external npm packages.

## Features

- Fetch User Activity: Get the latest public activity for any GitHub user.
- CLI-Based: Runs entirely from the command line.

- Caching: Automatically caches results for 30 minutes to improve performance and avoid rate limits.

- Zero Dependencies: Uses only the standard libraries included with Node.js.

## Requirements

- Node.js (v14 or higher recommended for ES Module support)

## Installation

1. ### Clone the repository (or download the files):

``` git clone [https://github.com/your-username/github-activity.git](https://github.com/your-username/github-activity.git)
cd github-activity 
```


2. ### Make the script executable: (On macOS/Linux)

``` 
chmod +x index.js 
```


3. ### Link the script for global use:
This command creates a global symlink, allowing you to run the ``` github-activity ``` command from anywhere on your system.

``` 
npm link 
```


## Usage

To use the tool, simply call ``` github-activity ``` followed by the GitHub username.

``` 
github-activity <username> 
```


#### Example Command

``` 
github-activity kamranahmedse 
```


#### Example Output

``` Fetching new data for kamranahmedse
Cache Saved!
- Pushed 2 commit(s) to kamranahmedse/developer-roadmap
- Pushed 1 commit(s) to kamranahmedse/developer-roadmap
- Starred repo freeCodeCamp/freeCodeCamp
- Created new repository kamranahmedse/new-project
- Opened issue 'Fix typo in docs' in kamranahmedse/developer-roadmap
```


#### Cached Response

If you run the same command within 30 minutes, it will use the cache:

``` github-activity kamranahmedse ```


``` Using Cached Data
--- Activity (from cache) ---
- Pushed 2 commit(s) to kamranahmedse/developer-roadmap
- Pushed 1 commit(s) to kamranahmedse/developer-roadmap
- Starred repo freeCodeCamp/freeCodeCamp
- Created new repository kamranahmedse/new-project
- Opened issue 'Fix typo in docs' in kamranahmedse/developer-roadmap
```

Project URL: [Link](https://roadmap.sh/projects/github-user-activity)

To clear the cache, you can delete the .cache directory that is created in the project's folder.