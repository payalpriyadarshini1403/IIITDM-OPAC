# ============================================================
# push-to-github.ps1
# Pushes all project files to GitHub via API (no git needed)
# Usage: Run this script, enter your GitHub token when asked
# ============================================================

$OWNER = "payalpriyadarshini1403"
$REPO  = "IIITDM-OPAC"
$BRANCH = "main"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  IIITDM OPAC - GitHub Pusher" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aapka GitHub Personal Access Token enter karo:" -ForegroundColor Yellow
Write-Host "(GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate)" -ForegroundColor Gray
Write-Host ""
$TOKEN = Read-Host -AsSecureString "Token"
$TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($TOKEN))

$headers = @{
    "Authorization" = "token $TOKEN"
    "Accept"        = "application/vnd.github+json"
    "User-Agent"    = "OPAC-Pusher"
}

# ── Get or create branch ────────────────────────────────────
Write-Host ""
Write-Host "Checking repo..." -ForegroundColor Cyan

try {
    $repoInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO" -Headers $headers
    Write-Host "Repo found: $($repoInfo.full_name)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not access repo. Check token and repo name." -ForegroundColor Red
    exit 1
}

# Get latest commit SHA for main branch (or create it)
try {
    $ref = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/ref/heads/$BRANCH" -Headers $headers
    $latestSha = $ref.object.sha
    Write-Host "Branch '$BRANCH' exists. Latest SHA: $latestSha" -ForegroundColor Green
} catch {
    Write-Host "Branch '$BRANCH' not found, will create it." -ForegroundColor Yellow
    $latestSha = $null
}

# ── Files to upload ─────────────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Collect all files (excluding node_modules, dist, .git, this script)
$excludeDirs = @("node_modules", "dist", ".git", ".github")
$excludeFiles = @("push-to-github.ps1")

$allFiles = Get-ChildItem -Path $scriptDir -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Replace($scriptDir + "\", "").Replace("\", "/")
    $isExcluded = $false
    foreach ($ex in $excludeDirs) {
        if ($relativePath.StartsWith($ex + "/") -or $relativePath -eq $ex) {
            $isExcluded = $true; break
        }
    }
    foreach ($ex in $excludeFiles) {
        if ($_.Name -eq $ex) { $isExcluded = $true; break }
    }
    -not $isExcluded
}

# Also include .github/workflows/deploy.yml
$workflowFile = Join-Path $scriptDir ".github\workflows\deploy.yml"
if (Test-Path $workflowFile) {
    $allFiles = @(Get-Item $workflowFile) + $allFiles
}

Write-Host ""
Write-Host "Files to upload: $($allFiles.Count)" -ForegroundColor Cyan

# ── Build git tree ───────────────────────────────────────────
Write-Host "Building file tree..." -ForegroundColor Cyan

$treeItems = @()
foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Replace($scriptDir + "\", "").Replace("\", "/")
    
    # Read file as bytes and base64
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $b64 = [Convert]::ToBase64String($bytes)
    
    # Create blob
    $blobBody = @{ content = $b64; encoding = "base64" } | ConvertTo-Json
    try {
        $blob = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/blobs" `
            -Method POST -Headers $headers -Body $blobBody -ContentType "application/json"
        $treeItems += @{ path = $relativePath; mode = "100644"; type = "blob"; sha = $blob.sha }
        Write-Host "  + $relativePath" -ForegroundColor Gray
    } catch {
        Write-Host "  ! SKIP: $relativePath (error: $_)" -ForegroundColor DarkYellow
    }
}

# ── Create tree ──────────────────────────────────────────────
Write-Host ""
Write-Host "Creating git tree..." -ForegroundColor Cyan
$treeBody = @{ tree = $treeItems }
if ($latestSha) { $treeBody["base_tree"] = $latestSha }
$treeBody = $treeBody | ConvertTo-Json -Depth 10

$tree = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/trees" `
    -Method POST -Headers $headers -Body $treeBody -ContentType "application/json"
Write-Host "Tree created: $($tree.sha)" -ForegroundColor Green

# ── Create commit ────────────────────────────────────────────
Write-Host "Creating commit..." -ForegroundColor Cyan
$commitBody = @{
    message = "Deploy IIITDM OPAC - React app with GitHub Actions"
    tree    = $tree.sha
} 
if ($latestSha) { $commitBody["parents"] = @($latestSha) }
$commitBody = $commitBody | ConvertTo-Json

$commit = Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/commits" `
    -Method POST -Headers $headers -Body $commitBody -ContentType "application/json"
Write-Host "Commit created: $($commit.sha)" -ForegroundColor Green

# ── Update branch ref ────────────────────────────────────────
Write-Host "Updating branch ref..." -ForegroundColor Cyan
$refBody = @{ sha = $commit.sha; force = $true } | ConvertTo-Json

if ($latestSha) {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/refs/heads/$BRANCH" `
        -Method PATCH -Headers $headers -Body $refBody -ContentType "application/json" | Out-Null
} else {
    $createRefBody = @{ ref = "refs/heads/$BRANCH"; sha = $commit.sha } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.github.com/repos/$OWNER/$REPO/git/refs" `
        -Method POST -Headers $headers -Body $createRefBody -ContentType "application/json" | Out-Null
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repo:    https://github.com/$OWNER/$REPO" -ForegroundColor Cyan
Write-Host "Actions: https://github.com/$OWNER/$REPO/actions" -ForegroundColor Cyan
Write-Host "Site:    https://$OWNER.github.io/$REPO/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ab GitHub Actions tab check karo - 2-3 min mein site live ho jaayegi!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
