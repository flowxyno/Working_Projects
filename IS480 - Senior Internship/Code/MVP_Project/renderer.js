const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun } = require('docx');

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

// Helper function to save exported files to the directory of the users chioice
function saveFile(blob, fileName) {
    // Create a link element
    const link = document.createElement('a');

    // Set the download attribute with a filename
    link.download = fileName;

    // Create a URL for the blog and set it as the href attribute
    link.href = window.URL.createObjectURL(blob);

    // Append the link to the body
    document.body.appendChild(link);

    // Background click the link to trigger the download
    link.click();

    // Clean up the blob URL
    window.URL.revokeObjectURL(link.href);

    // Remove the link from the document
    document.body.removeChild(link);
}

// This function finds and lists directories within the working directory that contain the same 9 digit CTC link ID number
function findDuplicatesAndDisplay(workingDirectory) {
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

    // Step 3: Create a table to display the data
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = 'Student ID';
    headerRow.insertCell().textContent = 'Directories';

    for (const studentId in ret) {
        if (ret[studentId].length > 1) {
            const row = table.insertRow();
            row.insertCell().textContent = studentId;
            row.insertCell().textContent = ret[studentId].join(', ');
        }
    }

    // Display the table in the HTML document
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    tableContainer.innerHTML = '<br>'
    tableContainer.appendChild(table);

    // Line break after the Table to space out the button
    tableContainer.appendChild(document.createElement('br'));

    // Create button to export to Excel
    const exportButton = document.createElement('button');
    
    exportButton.textContent = 'Export to Excel';
    exportButton.onclick = () => exportToExcel(ret);
    tableContainer.appendChild(exportButton);
}
// This function exports the built list of duplicate student directories from the findDuplicatesAndDisplay function
async function exportToExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Duplicates');

    // Define the default width for columns
    const defaultColWidth = 12;

    // Set the default width for columns
    worksheet.properties.defaultColWidth = defaultColWidth;

    // Add headers and format them
    const headerRow = worksheet.addRow(['Student ID', 'Directories']);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data and format it
    Object.keys(data).forEach(studentId => {
        const directories = data[studentId];
        // Ensure directories is an array and join its elements
        if(directories.length > 1){
            const directoriesString = Array.isArray(directories) ? directories.join(', ') : '';

            const row = worksheet.addRow([studentId, directoriesString]);
            // formatting for the row
            row.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        }
    });

    // Create a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveFile(blob, 'duplicates.xlsx');
}

// This function finds student directories have mistakenly nested inside of other students directories
function findDirsAndMove(workingDirectory) {
    // Clear previous table content
    const tableContainer = document.getElementById('directoriesTableContainer');
    tableContainer.innerHTML = '';
    tableContainer.innerHTML = '<br>';

    // Create a new table
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = 'Directory Name';
    headerRow.insertCell().textContent = 'Moved';

    // Read the contents of the working directory (layer 1)
    const layer1Directories = fs.readdirSync(workingDirectory);

    // Loop through each directory in layer 1
    layer1Directories.forEach(layer1Dir => {
        const layer1DirPath = path.join(workingDirectory, layer1Dir);

        // Check if it's a directory
        if (fs.statSync(layer1DirPath).isDirectory()) {
            // Read the contents of the layer 1 directory (layer 2)
            const layer2Contents = fs.readdirSync(layer1DirPath);

            // Check each item in layer 2
            layer2Contents.forEach(layer2Item => {
                const layer2ItemPath = path.join(layer1DirPath, layer2Item);

                // Check if it's a directory and matches the student ID format
                if (fs.statSync(layer2ItemPath).isDirectory() && matchesStudentId(layer2Item)) {
                    // Construct the destination path in layer 1
                    const destinationPath = path.join(workingDirectory, layer2Item);

                    try {
                        // Move the directory from layer 2 to layer 1
                        fs.renameSync(layer2ItemPath, destinationPath);
                        console.log(`Directory moved: ${layer2ItemPath} -> ${destinationPath}`);

                        // Add row to the table indicating the directory and successful move
                        const row = table.insertRow();
                        row.insertCell().textContent = layer2Item;
                        row.insertCell().textContent = 'Yes';
                    } catch (error) {
                        console.error(`Error moving directory: ${error}`);

                        // Add row to the table indicating the directory and failed move
                        const row = table.insertRow();
                        row.insertCell().textContent = layer2Item;
                        row.insertCell().textContent = 'No';
                    }
                }
            });
        }
    });

    // Append the table to the container
    tableContainer.appendChild(table);
}

function findDirectoriesWithoutPatterns(workingDirectory, patterns) {
    // Array to store directories without any of the patterns
    const directoriesWithoutPatterns = [];

    // Read the contents of the working directory
    const directories = fs.readdirSync(workingDirectory);

    // Loop through each directory
    directories.forEach(directory => {
        // Construct the full path of the directory
        const directoryPath = path.join(workingDirectory, directory);

        // Check if it's a directory
        if (fs.statSync(directoryPath).isDirectory()) {
            // Check if "CERTIFIED SCHEDULES" directory exists
            const certifiedSchedulesPath = path.join(directoryPath, 'CERTIFIED SCHEDULES');
            if (fs.existsSync(certifiedSchedulesPath)) {
                // Read the contents of "CERTIFIED SCHEDULES" directory
                const files = fs.readdirSync(certifiedSchedulesPath);
                // Check each file in the directory
                const containsPattern = files.some(file => {
                    // Check if any of the patterns exist at the beginning of the file name
                    return patterns.some(pattern => file.startsWith(pattern));
                });
                // If none of the patterns are found, add the directory to the list
                if (!containsPattern) {
                    directoriesWithoutPatterns.push(directory);
                }
            }
        }
    });

    // Display the result in the resultContainer
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';
    if (directoriesWithoutPatterns.length > 0) {
        const list = document.createElement('ul');
        directoriesWithoutPatterns.forEach(directory => {
            const listItem = document.createElement('li');
            listItem.textContent = directory;
            list.appendChild(listItem);
        });
        resultContainer.appendChild(list);

        const exportButton = document.createElement('button');
    
        exportButton.textContent = 'Export to Word';
        exportButton.onclick = () => exportToWord();
        resultContainer.appendChild(exportButton);
    } else {
        resultContainer.textContent = 'All directories contain at least one of the patterns.';
    }
}

// Function to be called when the button is clicked
function handleFindDirectoriesWithoutPatterns() {
    const workingDirectory = document.getElementById('workingDirectory').value;
    const pattern1 = document.getElementById('pattern1').value;
    const pattern2 = document.getElementById('pattern2').value;
    const pattern3 = document.getElementById('pattern3').value;
    const pattern4 = document.getElementById('pattern4').value;
    const patterns = [pattern1, pattern2, pattern3, pattern4];
    findDirectoriesWithoutPatterns(workingDirectory, patterns);
}

async function exportToWord() {
    const resultContainer = document.getElementById('resultContainer');
    const items = resultContainer.getElementsByTagName('li');
    
    if (items.length === 0) {
        alert('No data to export.');
        return;
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun("Directories To Be Archived:"),
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun("")
                    ]
                }),
                ...Array.from(items).map(item => new Paragraph(item.textContent))
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);

    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    saveFile(blob, 'Directories_To_Archive.docx');
}

// This function creates a new student directory complete with the "CERTIFIED SCHEDULES" and "FILE" directories embedded in the new directory
function createNewFolder() {
    const workingDirectory = document.getElementById('workingDirectory').value;
    const newFolderName = document.getElementById('newDirectoryName').value;
    const certScheduleDir = "CERTIFIED SCHEDULES";
    const fileDir = "FILE";
    if (!newFolderName) {
        console.error('Please provide a folder name.');
        return;
    }

    const newFolderPath = path.join(workingDirectory, newFolderName);
    const certSchedulePath = path.join(workingDirectory, newFolderName, certScheduleDir);
    const fileDirPath = path.join(workingDirectory, newFolderName, fileDir);

    fs.mkdir(newFolderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully:', newFolderPath);
    });
    fs.mkdir(certSchedulePath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully:', newFolderPath);
    });
    fs.mkdir(fileDirPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully:', newFolderPath);
    });
}

