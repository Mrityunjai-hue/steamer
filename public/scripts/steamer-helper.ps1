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
    Write-Host "Popular Game & Franchise AppIDs:" -ForegroundColor Yellow
    Write-Host "  * 311210  : Call of Duty: Black Ops III (Offline Campaign & Zombies)"
    Write-Host "  * 202970  : Call of Duty: Black Ops II"
    Write-Host "  * 393080  : Call of Duty: Modern Warfare Remastered"
    Write-Host "  * 476620  : Call of Duty: WWII"
    Write-Host "  * 2208920 : Assassin's Creed Valhalla (Ubisoft Connect Bypass)"
    Write-Host "  * 2420110 : Assassin's Creed Mirage"
    Write-Host "  * 812140  : Assassin's Creed Odyssey"
    Write-Host "  * 1174180 : Red Dead Redemption 2 (-scOfflineOnly)"
    Write-Host "  * 271590  : Grand Theft Auto V"
    Write-Host "  * 1774580 : Star Wars Jedi: Survivor (EA App Bypass)"
    Write-Host "  * 2215430 : Ghost of Tsushima DIRECTOR'S CUT (PSN SDK Bypass)"
    Write-Host "  * 1091500 : Cyberpunk 2077 (--launcher-skip)"
    Write-Host "  * 2358720 : Black Myth: Wukong"
    Write-Host "  * 1245620 : Elden Ring (EAC Offline)"
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
    $res = Invoke-RestMethod -Uri $ApiUrl -Method Get -TimeoutSec 10
    if ($res -and $res.manifests -and $res.manifests.Count -gt 0) {
        $ManifestData = $res.manifests[0]
    }
} catch {
    # If internet or offline, continue with local template
}

$TargetAcf = Join-Path $SteamApps "appmanifest_$AppId.acf"

# 4. Download and Install Manifest
$DirectAcfUrl = "https://steamer-one.vercel.app/api/manifests/download/$AppId"
$installedOk = $false

if ($ManifestData) {
    Write-Host "[INFO] Found verified fix: $($ManifestData.title) ($($ManifestData.launcher))" -ForegroundColor Green
}

Write-Host "[INFO] Downloading verified Valve .acf manifest from Steamer repository..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $DirectAcfUrl -OutFile $TargetAcf -UseBasicParsing -TimeoutSec 15
    if (Test-Path $TargetAcf) {
        $installedOk = $true
        Write-Host "[SUCCESS] Successfully installed 'appmanifest_$AppId.acf' directly into:" -ForegroundColor Green
        Write-Host "          $SteamApps" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Remote connection unavailable. Generating local verified manifest..." -ForegroundColor Yellow
}

if (-not $installedOk) {
    $titleStr = if ($ManifestData -and $ManifestData.title) { $ManifestData.title } else { "Steamer Game $AppId" }
    $cleanTitle = $titleStr.Replace('"', '')
    $timestamp = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s))
    
    $AcfContent = @"
"AppState"
{
	"appid"		"$AppId"
	"Universe"		"1"
	"name"		"$cleanTitle"
	"StateFlags"		"4"
	"installdir"		"$cleanTitle"
	"LastUpdated"		"$timestamp"
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
    Write-Host "[SUCCESS] Generated and installed offline manifest: $TargetAcf" -ForegroundColor Green
}

if ($ManifestData -and $ManifestData.launchArguments) {
    Write-Host ""
    Write-Host "[RECOMMENDED LAUNCH ARGUMENTS]: $($ManifestData.launchArguments)" -ForegroundColor Yellow
    Write-Host "Set this in Steam: Right Click Game > Properties > Launch Options."
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

