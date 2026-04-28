:: ============================================================
::  SECURDATA PRO — Diagnostic Scanner FREE v1.0
::  Autore  : ProfitPickers / SecurData.pro
::  Licenza : Uso libero, nessun dato inviato a server
::  Sito    : https://profitpickers.github.io/securdata.pro/
:: ============================================================
:: Questo script e' di SOLA LETTURA: non modifica nulla.
:: Genera una cartella Report_Diagnostico_[data] con file .txt.

setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title SecurData PRO — FREE Diagnostic Scanner

:: ── Colori: verde su nero ────────────────────────────────────
color 0A

:: ── Avviso opzionale privilegi Admin ─────────────────────────
net session >nul 2>&1
if %errorLevel% neq 0 (
    color 0E
    echo.
    echo  [AVVISO] Stai eseguendo lo scanner senza privilegi di Amministratore.
    echo  Alcuni comandi (es. driverquery, battery) potrebbero restituire
    echo  dati parziali. Per un report completo, esegui come Amministratore.
    echo.
    pause
    color 0A
)

:: ── Timestamp per nome cartella ───────────────────────────────
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set "DT=%%I"
if defined DT (
    set "FOLDER=Report_Diagnostico_%DT:~0,4%-%DT:~4,2%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%"
) else (
    set "FOLDER=Report_Diagnostico_%date:~-4%-%date:~3,2%-%date:~0,2%"
)

mkdir "%FOLDER%" 2>nul

cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║     SECURDATA PRO — FREE DIAGNOSTIC SCANNER v1.0    ║
echo  ║         https://profitpickers.github.io/             ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Cartella di output : %FOLDER%
echo  Data analisi       : %date%  Ora: %time%
echo.
echo  ── Avanzamento ─────────────────────────────────────────
echo.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 1 — HARDWARE
:: ═══════════════════════════════════════════════════════════
echo  [1/6] Analisi Hardware in corso...

set "HW=%FOLDER%\01_Hardware.txt"
echo ============================================================ > "%HW%"
echo  SECURDATA PRO — Report Hardware                            >> "%HW%"
echo  Data: %date%  Ora: %time%                                   >> "%HW%"
echo ============================================================ >> "%HW%"

:: CPU
echo. >> "%HW%"
echo ── PROCESSORE (CPU) ─────────────────────────────────── >> "%HW%"
wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed,Architecture /format:list 2>nul >> "%HW%"
wmic cpu get L2CacheSize,L3CacheSize /format:list 2>nul >> "%HW%"
:: Fallback PowerShell per Windows 11 24H2+
powershell -NoProfile -Command "Try { Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed | Format-List } Catch {}" 2>nul >> "%HW%"

:: RAM
echo. >> "%HW%"
echo ── MEMORIA RAM ──────────────────────────────────────── >> "%HW%"
wmic memorychip get Capacity,Speed,Manufacturer,DeviceLocator,PartNumber /format:list 2>nul >> "%HW%"
wmic memphysical get MaxCapacity /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_PhysicalMemory | Select-Object DeviceLocator,Manufacturer,PartNumber,@{n='CapacityGB';e={[math]::Round($_.Capacity/1GB,1)}},Speed | Format-List } Catch {}" 2>nul >> "%HW%"

:: Dischi HDD/SSD
echo. >> "%HW%"
echo ── DISCHI (HDD/SSD) ─────────────────────────────────── >> "%HW%"
wmic diskdrive get Model,Size,MediaType,Status,SerialNumber /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_DiskDrive | Select-Object Model,@{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}},MediaType,Status,SerialNumber | Format-List } Catch {}" 2>nul >> "%HW%"

:: Partizioni logiche
echo. >> "%HW%"
echo ── PARTIZIONI LOGICHE ───────────────────────────────── >> "%HW%"
wmic logicaldisk get Caption,FileSystem,Size,FreeSpace,VolumeName /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-PSDrive -PSProvider FileSystem | Select-Object Name,@{n='TotalGB';e={[math]::Round(($_.Used+$_.Free)/1GB,2)}},@{n='FreeGB';e={[math]::Round($_.Free/1GB,2)}},@{n='UsedGB';e={[math]::Round($_.Used/1GB,2)}} | Format-Table -AutoSize } Catch {}" 2>nul >> "%HW%"

:: GPU
echo. >> "%HW%"
echo ── SCHEDA VIDEO (GPU) ───────────────────────────────── >> "%HW%"
wmic path win32_VideoController get Name,DriverVersion,AdapterRAM,VideoModeDescription /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,@{n='RAMGB';e={[math]::Round($_.AdapterRAM/1GB,2)}} | Format-List } Catch {}" 2>nul >> "%HW%"

:: Scheda Madre e BIOS
echo. >> "%HW%"
echo ── SCHEDA MADRE E BIOS ──────────────────────────────── >> "%HW%"
wmic baseboard get Product,Manufacturer,Version,SerialNumber /format:list 2>nul >> "%HW%"
wmic bios get Name,SMBIOSBIOSVersion,Manufacturer,ReleaseDate,SerialNumber /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_BaseBoard | Select-Object Product,Manufacturer,Version,SerialNumber | Format-List } Catch {}" 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_BIOS | Select-Object Name,SMBIOSBIOSVersion,Manufacturer,SerialNumber | Format-List } Catch {}" 2>nul >> "%HW%"

:: Batteria (laptop)
echo. >> "%HW%"
echo ── BATTERIA (se presente) ───────────────────────────── >> "%HW%"
wmic path win32_battery get Name,DesignCapacity,FullChargeCapacity,BatteryStatus,EstimatedChargeRemaining /format:list 2>nul >> "%HW%"
powershell -NoProfile -Command "Try { Get-CimInstance Win32_Battery | Select-Object Name,EstimatedChargeRemaining,BatteryStatus,DesignCapacity,FullChargeCapacity | Format-List } Catch {}" 2>nul >> "%HW%"

echo  [OK] Hardware analizzato.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 2 — SISTEMA OPERATIVO
:: ═══════════════════════════════════════════════════════════
echo  [2/6] Analisi Sistema Operativo...

set "OS=%FOLDER%\02_Sistema.txt"
echo ============================================================ > "%OS%"
echo  SECURDATA PRO — Report Sistema Operativo                  >> "%OS%"
echo  Data: %date%  Ora: %time%                                   >> "%OS%"
echo ============================================================ >> "%OS%"

echo. >> "%OS%"
echo ── INFORMAZIONI OS ──────────────────────────────────── >> "%OS%"
systeminfo >> "%OS%"

echo. >> "%OS%"
echo ── VERSIONE WINDOWS ─────────────────────────────────── >> "%OS%"
ver >> "%OS%"
wmic os get Caption,Version,BuildNumber,OSArchitecture,InstallDate,LastBootUpTime /format:list 2>nul >> "%OS%"

echo. >> "%OS%"
echo ── VARIABILI D'AMBIENTE ─────────────────────────────── >> "%OS%"
set >> "%OS%"

echo. >> "%OS%"
echo ── UPTIME SISTEMA ───────────────────────────────────── >> "%OS%"
powershell -NoProfile -Command "Try { $uptime = (Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime; Write-Host ('Uptime: {0} giorni {1} ore {2} minuti' -f [int]$uptime.Days,[int]$uptime.Hours,[int]$uptime.Minutes) } Catch {}" 2>nul >> "%OS%"

echo  [OK] Sistema analizzato.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 3 — SOFTWARE E APPLICAZIONI
:: ═══════════════════════════════════════════════════════════
echo  [3/6] Inventario Software e App (potrebbe richiedere qualche minuto)...

set "SW=%FOLDER%\03_Software.txt"
echo ============================================================ > "%SW%"
echo  SECURDATA PRO — Report Software e Applicazioni            >> "%SW%"
echo  Data: %date%  Ora: %time%                                   >> "%SW%"
echo ============================================================ >> "%SW%"

echo. >> "%SW%"
echo ── APP INSTALLATE (WMIC) ────────────────────────────── >> "%SW%"
wmic product get Name,Version,Vendor,InstallDate /format:list 2>nul >> "%SW%"

echo. >> "%SW%"
echo ── APP INSTALLATE (REGISTRY 64-bit) ─────────────────── >> "%SW%"
powershell -NoProfile -Command "Try { Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object {$_.DisplayName} | Select-Object DisplayName,DisplayVersion,Publisher,InstallDate | Sort-Object DisplayName | Format-Table -AutoSize } Catch {}" 2>nul >> "%SW%"

echo. >> "%SW%"
echo ── APP INSTALLATE (REGISTRY 32-bit) ─────────────────── >> "%SW%"
powershell -NoProfile -Command "Try { Get-ItemProperty 'HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' | Where-Object {$_.DisplayName} | Select-Object DisplayName,DisplayVersion,Publisher,InstallDate | Sort-Object DisplayName | Format-Table -AutoSize } Catch {}" 2>nul >> "%SW%"

echo. >> "%SW%"
echo ── APP MICROSOFT STORE ──────────────────────────────── >> "%SW%"
powershell -NoProfile -Command "Try { Get-AppxPackage | Select-Object Name,Version,Publisher | Sort-Object Name | Format-Table -AutoSize } Catch {}" 2>nul >> "%SW%"

echo. >> "%SW%"
echo ── PROCESSI IN ESECUZIONE ───────────────────────────── >> "%SW%"
tasklist /v >> "%SW%"

echo. >> "%SW%"
echo ── SERVIZI DI SISTEMA ───────────────────────────────── >> "%SW%"
sc query type= all state= all >> "%SW%"

echo. >> "%SW%"
echo ── TASK PIANIFICATI ─────────────────────────────────── >> "%SW%"
schtasks /query /fo LIST /v 2>nul >> "%SW%"

echo. >> "%SW%"
echo ── DRIVER INSTALLATI ────────────────────────────────── >> "%SW%"
driverquery /v 2>nul >> "%SW%"

echo  [OK] Software inventariato.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 4 — RETE E CONNETTIVITA'
:: ═══════════════════════════════════════════════════════════
echo  [4/6] Analisi Rete e Connettivita'...

set "NET=%FOLDER%\04_Rete.txt"
echo ============================================================ > "%NET%"
echo  SECURDATA PRO — Report Rete e Connettivita'               >> "%NET%"
echo  Data: %date%  Ora: %time%                                   >> "%NET%"
echo ============================================================ >> "%NET%"

echo. >> "%NET%"
echo ── CONFIGURAZIONE IP COMPLETA ───────────────────────── >> "%NET%"
ipconfig /all >> "%NET%"

echo. >> "%NET%"
echo ── TABELLA ARP (IP-MAC) ─────────────────────────────── >> "%NET%"
arp -a >> "%NET%"

echo. >> "%NET%"
echo ── CONNESSIONI ATTIVE E PORTE APERTE ────────────────── >> "%NET%"
netstat -ano >> "%NET%"

echo. >> "%NET%"
echo ── DNS CACHE ────────────────────────────────────────── >> "%NET%"
ipconfig /displaydns >> "%NET%"

echo. >> "%NET%"
echo ── NOME COMPUTER E WORKGROUP ────────────────────────── >> "%NET%"
hostname >> "%NET%"
net config workstation 2>nul >> "%NET%"

echo. >> "%NET%"
echo ── CARTELLE CONDIVISE ───────────────────────────────── >> "%NET%"
net share >> "%NET%"

echo. >> "%NET%"
echo ── TABELLA DI ROUTING ───────────────────────────────── >> "%NET%"
route print >> "%NET%"

echo. >> "%NET%"
echo ── PING TEST (google.com) ───────────────────────────── >> "%NET%"
ping -n 4 google.com >> "%NET%"

echo  [OK] Rete analizzata.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 5 — SICUREZZA
:: ═══════════════════════════════════════════════════════════
echo  [5/6] Analisi Sicurezza...

set "SEC=%FOLDER%\05_Sicurezza.txt"
echo ============================================================ > "%SEC%"
echo  SECURDATA PRO — Report Sicurezza                          >> "%SEC%"
echo  Data: %date%  Ora: %time%                                   >> "%SEC%"
echo ============================================================ >> "%SEC%"

echo. >> "%SEC%"
echo ── FIREWALL WINDOWS ─────────────────────────────────── >> "%SEC%"
netsh advfirewall show allprofiles 2>nul >> "%SEC%"

echo. >> "%SEC%"
echo ── CRITERI DI GRUPPO APPLICATI ──────────────────────── >> "%SEC%"
gpresult /r 2>nul >> "%SEC%"

echo. >> "%SEC%"
echo ── ACCOUNT UTENTI LOCALI ────────────────────────────── >> "%SEC%"
net user >> "%SEC%"
net localgroup administrators >> "%SEC%"

echo. >> "%SEC%"
echo ── AUDIT POLICY ─────────────────────────────────────── >> "%SEC%"
auditpol /get /category:* 2>nul >> "%SEC%"

echo. >> "%SEC%"
echo ── CERTIFICATI (UTENTE CORRENTE) ────────────────────── >> "%SEC%"
powershell -NoProfile -Command "Try { Get-ChildItem Cert:\CurrentUser\My | Select-Object Subject,Issuer,NotBefore,NotAfter,Thumbprint | Format-List } Catch {}" 2>nul >> "%SEC%"

echo. >> "%SEC%"
echo ── SESSIONI UTENTE ATTIVE ───────────────────────────── >> "%SEC%"
query user 2>nul >> "%SEC%"
query session 2>nul >> "%SEC%"

echo  [OK] Sicurezza analizzata.

:: ═══════════════════════════════════════════════════════════
::  SEZIONE 6 — FILE NASCOSTI E ZONE D'OMBRA
:: ═══════════════════════════════════════════════════════════
echo  [6/6] Ricerca File di Sistema Speciali...

set "FS=%FOLDER%\06_File_Sistema_Nascosti.txt"
echo ============================================================ > "%FS%"
echo  SECURDATA PRO — File di Sistema e Zone Nascoste           >> "%FS%"
echo  Data: %date%  Ora: %time%                                   >> "%FS%"
echo ============================================================ >> "%FS%"

echo. >> "%FS%"
echo ── FILE GIGANTI NELLA RADICE DI C:\ ─────────────────── >> "%FS%"
dir /a C:\pagefile.sys C:\hiberfil.sys C:\swapfile.sys 2>nul >> "%FS%"

echo. >> "%FS%"
echo ── SPAZIO OCCUPATO DA CARTELLE SISTEMA ──────────────── >> "%FS%"
powershell -NoProfile -Command "Try { $paths = @('C:\Windows\Temp','C:\Windows\Prefetch','C:\Windows\Panther','C:\Windows\Minidump','C:\Windows\SoftwareDistribution'); foreach($p in $paths){ if(Test-Path $p){ $sz = (Get-ChildItem $p -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum; Write-Host ('{0,-50} {1,8:N0} MB' -f $p, [math]::Round($sz/1MB,1)) }}} Catch {}" 2>nul >> "%FS%"

echo. >> "%FS%"
echo ── COPIE SHADOW (VSS) ───────────────────────────────── >> "%FS%"
vssadmin list shadows 2>nul >> "%FS%"
vssadmin list shadowstorage 2>nul >> "%FS%"

echo. >> "%FS%"
echo ── WINDOWS.OLD (se presente) ────────────────────────── >> "%FS%"
if exist "C:\Windows.old" (
    echo TROVATA: C:\Windows.old - Dimensione stimata: >> "%FS%"
    powershell -NoProfile -Command "Try { $sz=(Get-ChildItem 'C:\Windows.old' -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum; Write-Host ([math]::Round($sz/1GB,2),'GB') } Catch {}" 2>nul >> "%FS%"
) else (
    echo Non presente. >> "%FS%"
)

echo. >> "%FS%"
echo ── FLUSSI DATI ALTERNATIVI (ADS) su C:\Users ────────── >> "%FS%"
powershell -NoProfile -Command "Try { Get-ChildItem -Path $env:USERPROFILE -Recurse -ErrorAction SilentlyContinue | ForEach-Object { $ads = Get-Item -LiteralPath $_.FullName -Stream * -ErrorAction SilentlyContinue | Where-Object {$_.Stream -ne ':$DATA'}; if($ads){ Write-Host $_.FullName; $ads | Select-Object Stream,Length | Format-Table -AutoSize } } } Catch {}" 2>nul >> "%FS%"

echo  [OK] File sistema analizzati.

:: ═══════════════════════════════════════════════════════════
::  RIEPILOGO FINALE
:: ═══════════════════════════════════════════════════════════
set "SUMMARY=%FOLDER%\00_RIEPILOGO.txt"
echo ============================================================ > "%SUMMARY%"
echo  SECURDATA PRO — RIEPILOGO REPORT                          >> "%SUMMARY%"
echo  Generato il : %date%  alle: %time%                         >> "%SUMMARY%"
echo  Computer    : %computername%                               >> "%SUMMARY%"
echo  Utente      : %username%                                   >> "%SUMMARY%"
echo ============================================================ >> "%SUMMARY%"
echo. >> "%SUMMARY%"
echo  File generati in questa cartella:                          >> "%SUMMARY%"
echo  01_Hardware.txt          — CPU, RAM, Dischi, GPU, BIOS     >> "%SUMMARY%"
echo  02_Sistema.txt           — OS, variabili, uptime           >> "%SUMMARY%"
echo  03_Software.txt          — App, servizi, driver, task      >> "%SUMMARY%"
echo  04_Rete.txt              — IP, ARP, connessioni, routing   >> "%SUMMARY%"
echo  05_Sicurezza.txt         — Firewall, utenti, policy        >> "%SUMMARY%"
echo  06_File_Sistema_Nascosti.txt — pagefile, VSS, ADS, .old   >> "%SUMMARY%"
echo. >> "%SUMMARY%"
echo  Suggerimento: apri i file .txt con il Blocco Note o con    >> "%SUMMARY%"
echo  Notepad++ per una lettura piu comoda.                      >> "%SUMMARY%"
echo. >> "%SUMMARY%"
echo  Strumento: SecurData PRO — https://profitpickers.github.io >> "%SUMMARY%"

cls
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║              ANALISI COMPLETATA!                     ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║                                                      ║
echo  ║  Report salvato in:                                  ║
echo  ║  %FOLDER%
echo  ║                                                      ║
echo  ║  File generati:                                      ║
echo  ║   01_Hardware.txt           (CPU, RAM, Dischi, GPU)  ║
echo  ║   02_Sistema.txt            (OS, versione, uptime)   ║
echo  ║   03_Software.txt           (App, servizi, driver)   ║
echo  ║   04_Rete.txt               (IP, DNS, connessioni)   ║
echo  ║   05_Sicurezza.txt          (Firewall, policy)       ║
echo  ║   06_File_Sistema_Nascosti  (pagefile, VSS, .old)    ║
echo  ║   00_RIEPILOGO.txt          (indice report)          ║
echo  ║                                                      ║
echo  ║  Premi un tasto per aprire la cartella...            ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
pause
explorer "%FOLDER%"

endlocal
