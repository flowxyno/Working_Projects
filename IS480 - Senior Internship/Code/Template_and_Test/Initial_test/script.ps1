# Function to extract 9-digit numbers from a string
function Get-9DigitNumbers($inputString) {
    $pattern = '\b\d{9}\b'
    $matches = [regex]::Matches($inputString, $pattern)
    $numbers = @()
    foreach ($match in $matches) {
        $numbers += $match.Value
    }
    return $numbers
}

# Prompt user for the working directory path
$workingDirectory = Read-Host "Enter the working directory path"

# Find all directories in the working directory
$directories = Get-ChildItem -Path $workingDirectory -Directory

# Array to store recorded numbers
$recordedNumbers = @()

# Iterate through each directory to record 9-digit numbers
foreach ($directory in $directories) {
    $numbersInDirectoryName = Get-9DigitNumbers $directory.Name
    if ($numbersInDirectoryName) {
        $recordedNumbers += $numbersInDirectoryName
    }
}

# Remove duplicate recorded numbers
$recordedNumbers = $recordedNumbers | Select-Object -Unique

# Array to store matching directories
$matchingDirectories = @()

# Iterate through each directory again to find matching directories
foreach ($directory in $directories) {
    foreach ($number in $recordedNumbers) {
        if ($directory.Name -match $number) {
            $matchingDirectories += $directory.Name
            break
        }
    }
}

if ($matchingDirectories) {
    $outputFile = ".\output\matching_directories.txt"
    $matchingDirectories | Out-File -FilePath $outputFile
    Write-Host "Matching directories found. Output saved to $outputFile"
} else {
    Write-Host "No matching directories found in $workingDirectory"
}