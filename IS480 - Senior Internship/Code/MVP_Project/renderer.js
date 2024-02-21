const fs = require('fs');
const path = require('path');

// Helper function to check if a directory name matches the student ID format
function matchesStudentId(directoryName) {
    // Extract potential student ID part using a regular expression
    const matches = directoryName.match(/(\d{9})/);

    // Check if a potential student ID is found
    return matches !== null;
}

// Helper function to extract the student ID from a directory name
function extractStudentId(directoryName) {
    // Extract potential student ID part using a regular expression
    const matches = directoryName.match(/(\d{9})/);

    // Return the extracted student ID or an empty string if no match is found
    return matches ? matches[1] : '';
}

function findDuplicates(workingDirectory) {
    let ret = {};

    // Step 1: Loop over all the directories and when you find a student id, put it into the ret object as a key mapping to an empty array
    fs.readdirSync(workingDirectory).forEach(directory => {
        if (matchesStudentId(directory)) {
            const studentId = extractStudentId(directory);
            if (!(studentId in ret)) {
                ret[studentId] = [];
            }
        }
    });

    // Step 2: Loop over all the directories and if the name matches a key, push that directory name into the array for that key
    fs.readdirSync(workingDirectory).forEach(directory => {
        if (matchesStudentId(directory)) {
            const studentId = extractStudentId(directory);
            if (studentId in ret) {
                ret[studentId].push(directory);
            }
        }
    });

    // Step 3: Print out the IDs that map to more than one directory
    for (const studentId in ret) {
        if (ret[studentId].length > 1) {
            console.log(`Student ID ${studentId} maps to directories: ${ret[studentId].join(', ')}`);
        }
    }

    return ret;
}


function createNewFolder() {
    const workingDirectory = document.getElementById('workingDirectory').value;
    const newFolderName = document.getElementById('newDirectoryName').value;
    if (!newFolderName) {
        console.error('Please provide a folder name.');
        return;
    }

    const newFolderPath = path.join(workingDirectory, newFolderName);

    fs.mkdir(newFolderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully:', newFolderPath);
    });
}

