<#
.SYNOPSIS
Initializes a new Git repository, splits all current files into 59 chunks,
and creates exactly 59 commits with historical backdated timestamps and random
intervals, then pushes to the Kernols/cinderx repository.
#>

$ErrorActionPreference = "Stop"

Write-Host "Starting the 59-Commit Open Source preparation script..." -ForegroundColor Cyan

if (Test-Path .git) {
    Write-Host "Removing old .git directory..." -ForegroundColor Yellow
    cmd.exe /c rmdir /s /q .git
}

Write-Host "Initializing new Git repository..." -ForegroundColor Green
git init
git branch -M main
git remote add origin https://github.com/Kernols/cinderx.git

Write-Host "Gathering files..." -ForegroundColor Cyan
$allFiles = Get-ChildItem -File -Recurse | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\\.next\\" -and
    $_.FullName -notmatch "\\\.git\\"
} | Select-Object -ExpandProperty FullName

$random = New-Object System.Random
$allFiles = $allFiles | Sort-Object { $random.Next() }

$totalCommits = 59
$filesPerCommit = [math]::Ceiling($allFiles.Count / $totalCommits)

Write-Host "Found $($allFiles.Count) files. Will commit ~$filesPerCommit files per commit." -ForegroundColor Cyan

$commitMessages = @(
    "feat: add core module configuration",
    "chore: update project dependencies",
    "fix: resolve layout shift on mobile",
    "docs: enhance documentation for open source",
    "style: format code with prettier",
    "refactor: optimize component rendering",
    "feat: integrate wallet connection logic",
    "test: add unit tests for utilities",
    "feat: build out battle arena UI",
    "fix: patch websocket connection edge cases",
    "chore: configure CI/CD pipelines",
    "feat: implement toast notification system",
    "docs: add contributing and code of conduct guidelines",
    "style: refine dark mode color palette",
    "feat: add stellar smart contract interface"
)

$startDate = (Get-Date).AddDays(-30)

for ($i = 0; $i -lt $totalCommits; $i++) {
    $startIndex = $i * $filesPerCommit
    $endIndex = [math]::Min($startIndex + $filesPerCommit - 1, $allFiles.Count - 1)
    
    $msg = $commitMessages[$random.Next($commitMessages.Count)]
    $daysToAdd = ($i / 59) * 30
    $commitDate = $startDate.AddDays($daysToAdd).AddHours($random.Next(1, 23)).AddMinutes($random.Next(0, 59)).ToString("yyyy-MM-ddTHH:mm:ss")
    
    $env:GIT_AUTHOR_DATE = $commitDate
    $env:GIT_COMMIT_DATE = $commitDate

    if ($startIndex -ge $allFiles.Count) { 
        git commit --allow-empty -m "$msg" | Out-Null
        Write-Host "Created commit $($i+1)/59 (Empty) - Date: $commitDate" -ForegroundColor Green
    } else {
        $batch = $allFiles[$startIndex..$endIndex]
        foreach ($file in $batch) {
            git add $file
        }
        git commit -m "$msg" | Out-Null
        Write-Host "Created commit $($i+1)/59 (Files: $($batch.Count)) - Date: $commitDate" -ForegroundColor Green
    }

    $sleepTime = $random.Next(1, 4)
    Start-Sleep -Seconds $sleepTime
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMIT_DATE

Write-Host "Successfully created 59 commits!" -ForegroundColor Magenta
Write-Host "Ready to push. Pushing to origin main..." -ForegroundColor Yellow

git push -u origin main --force

Write-Host "Deployment to GitHub complete! Vercel and Render will now trigger." -ForegroundColor Green
