const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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

    // Create button to export to CSV
    const exportButton = document.createElement('button');
    
    exportButton.textContent = 'Export to Excel';
    exportButton.onclick = () => exportToExcel(ret);
    tableContainer.appendChild(exportButton);
}

function exportToExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Duplicates');

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

    // Adjust column widths automatically
    worksheet.columns.forEach((column) => {
        column.width = 'auto';
    });

    // Save the workbook to a file
    const excelFilePath = path.join(__dirname, 'duplicates.xlsx');
    workbook.xlsx.writeFile(excelFilePath)
        .then(() => {
            console.log('Excel file exported successfully:', excelFilePath);
        })
        .catch((error) => {
            console.error('Error exporting to Excel:', error);
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

