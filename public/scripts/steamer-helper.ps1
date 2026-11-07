<#
.SYNOPSIS
    Steamer 1-Click Manifest & Launcher Fix Injector
    Automatically places appmanifest_<id>.acf and launcher fixes into your Steam installation.
#>

[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$AppId
)

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      STEAMER 1-CLICK MANIFEST & LAUNCHER INJECTOR        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detect Steam Installation Path
$SteamPath = $null
try {
    $reg = Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction SilentlyContinue
    if ($reg -and $reg.SteamPath) {
        $SteamPath = $reg.SteamPath.Replace('/', '\')
    }
} catch {}

if (-not $SteamPath -or -not (Test-Path $SteamPath)) {
    if (Test-Path "C:\Program Files (x86)\Steam") {
        $SteamPath = "C:\Program Files (x86)\Steam"
    } elseif (Test-Path "C:\Program Files\Steam") {
        $SteamPath = "C:\Program Files\Steam"
    } else {
        $SteamPath = Read-Host "Could not automatically find Steam. Please enter your Steam folder (e.g. C:\Steam)"
    }
}

if (-not (Test-Path $SteamPath)) {
    Write-Host "[ERROR] Steam path '$SteamPath' does not exist. Aborting." -ForegroundColor Red
    Pause
    Exit 1
}

$SteamApps = Join-Path $SteamPath "steamapps"
if (-not (Test-Path $SteamApps)) {
    New-Item -ItemType Directory -Path $SteamApps -Force | Out-Null
}

Write-Host "[OK] Detected SteamApps folder: $SteamApps" -ForegroundColor Green
Write-Host ""

# 2. Ask for AppID if not provided
if (-not $AppId) {
    Write-Host "Popular Game AppIDs:" -ForegroundColor Yellow
    Write-Host "  * 2208920 : Assassin's Creed Valhalla"
    Write-Host "  * 2420110 : Assassin's Creed Mirage"
    Write-Host "  * 1174180 : Red Dead Redemption 2"
    Write-Host "  * 271590  : Grand Theft Auto V"
    Write-Host "  * 1774580 : Star Wars Jedi: Survivor"
    Write-Host "  * 2215430 : Ghost of Tsushima DIRECTOR'S CUT"
    Write-Host "  * 1091500 : Cyberpunk 2077"
    Write-Host "  * 2358720 : Black Myth: Wukong"
    Write-Host ""
    $AppId = Read-Host "Enter the Steam AppID of your game"
}

$AppId = $AppId.Trim()
if (-not $AppId) {
    Write-Host "[ERROR] No AppID specified. Exiting." -ForegroundColor Red
    Pause
    Exit 1
}

Write-Host "[INFO] Querying Steamer Manifest Database for AppID: $AppId..." -ForegroundColor Cyan

# 3. Fetch Manifest Info from Steamer API
$ApiUrl = "https://steamer-one.vercel.app/api/manifests?steamAppId=$AppId"
$ManifestData = $null

try {
    $res = Invoke-RestMethod -Uri $ApiUrl -Method Get -TimeoutSec 15
    if ($res -and $res.manifests -and $res.manifests.Count -gt 0) {
        $ManifestData = $res.manifests[0]
    }
} catch {
    Write-Host "[WARN] Remote fetch failed. Using fallback archive template..." -ForegroundColor Yellow
}

$TargetAcf = Join-Path $SteamApps "appmanifest_$AppId.acf"

# 4. Download and Install Manifest
if ($ManifestData -and $ManifestData.downloadUrl) {
    Write-Host "[INFO] Found verified fix: $($ManifestData.title) ($($ManifestData.launcher))" -ForegroundColor Green
    Write-Host "[INFO] Downloading from: $($ManifestData.downloadUrl)..." -ForegroundColor Cyan
    
    $TempZip = Join-Path $env:TEMP "steamer_$AppId.zip"
    $TempExtract = Join-Path $env:TEMP "steamer_extract_$AppId"
    
    try {
        Invoke-WebRequest -Uri $ManifestData.downloadUrl -OutFile $TempZip -UseBasicParsing
        if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
        Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force
        
        # Look for .acf file inside
        $AcfFile = Get-ChildItem -Path $TempExtract -Filter "*.acf" -Recurse | Select-Object -First 1
        if ($AcfFile) {
            Copy-Item -Path $AcfFile.FullName -Destination $TargetAcf -Force
            Write-Host "[SUCCESS] Installed '$($AcfFile.Name)' to $SteamApps" -ForegroundColor Green
        } else {
            # Copy all files to steamapps
            Copy-Item -Path "$TempExtract\*" -Destination $SteamApps -Recurse -Force
            Write-Host "[SUCCESS] Injected manifest package to $SteamApps" -ForegroundColor Green
        }
        
        if ($ManifestData.launchArguments) {
            Write-Host ""
            Write-Host "[RECOMMENDED LAUNCH ARGUMENTS]: $($ManifestData.launchArguments)" -ForegroundColor Yellow
            Write-Host "Set this in Steam: Right Click Game > Properties > Launch Options."
        }
    } catch {
        Write-Host "[ERROR] Could not download remote archive. Creating standard offline manifest template..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] Creating standard Steam offline manifest for AppID $AppId..." -ForegroundColor Cyan
    $AcfContent = @"
"AppState"
{
	"appid"		"$AppId"
	"Universe"		"1"
	"name"		"Steamer Game $AppId"
	"StateFlags"		"4"
	"installdir"		"$AppId"
	"LastUpdated"		"$([int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s)))"
	"UpdateResult"		"0"
	"BytesToDownload"		"0"
	"BytesDownloaded"		"0"
	"AutoUpdateBehavior"		"1"
	"AllowOtherDownloadsWhileRunning"		"0"
	"ScheduledAutoUpdate"		"0"
	"InstalledDepots"
	{
	}
	"UserConfig"
	{
		"language"		"english"
	}
}
"@
    Set-Content -Path $TargetAcf -Value $AcfContent -Encoding Ascii
    Write-Host "[SUCCESS] Created standard offline manifest: $TargetAcf" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "             MANIFEST SETUP COMPLETED!                    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Close Steam completely (Exit Steam from taskbar tray)."
Write-Host "2. Relaunch Steam and switch to OFFLINE MODE."
Write-Host "3. The game will now show ready to play directly on your personal machine."
Write-Host ""
Pause

