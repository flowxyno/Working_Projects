$logFile = "$env:USERPROFILE\Desktop\window_log.txt"
"=== Window Log Started: $(Get-Date) ===" | Out-File -FilePath $logFile

while ($true) {
    $windows = Get-Process | Where-Object {
        $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne ''
    } | Select-Object Name, MainWindowTitle

    foreach ($win in $windows) {
        "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss')) - $($win.Name) - $($win.MainWindowTitle)" | Out-File -Append -FilePath $logFile
    }

    Start-Sleep -Seconds 12
}
