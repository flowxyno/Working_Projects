# Prompt for Working Directory
$workingDirectory = Read-Host "Enter the working Directory: "

# Prompt for Folder Name
$newFolderName = Read-Host "Enter the new folder name: "

# Constructing the full file path
$newFolderPath = Join-Path -Path $workingDirectory -ChildPath $newFolderName

# Create the new folder
try {
    New-Item -Path $newFolderPath -ItemType Directory -ErrorAction Stop | Out-Null
    Write-Host "Folder '$newFolderName' created scuccessfully in '$workingDirectory' "
}catch{
    Write-Host "Error creating folder '$newFolderName':"
    exit 1
}