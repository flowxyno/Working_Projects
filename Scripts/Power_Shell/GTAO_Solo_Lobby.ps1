# GTA V Enhanced Edition Solo Public Lobby Tool

# Find all GTA-related processes
$gta = Get-Process | Where-Object { $_.ProcessName -match "GTA5" }

if ($gta) {
    foreach ($proc in $gta) {
        Write-Host "Suspending $($proc.ProcessName)..."
        & "pssuspend64.exe" $proc.ProcessName
    }

    Start-Sleep -Seconds 10

    foreach ($proc in $gta) {
        Write-Host "Resuming $($proc.ProcessName)..."
        & "pssuspend64.exe" -r $proc.ProcessName
    }

    Write-Host "Done! You should now be in a solo public lobby."
} else {
    Write-Host "No GTA5 processes found. Make sure GTA Online is running."
}
