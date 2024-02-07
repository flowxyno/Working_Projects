const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function findDuplicates() {
    const workingDirectory = document.getElementById('workingDirectory').value;
    const command = `powershell.exe -ExecutionPolicy Bypass -File .\\script.ps1`
    //const command = `powershell.exe -File script.ps1`;
    exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
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