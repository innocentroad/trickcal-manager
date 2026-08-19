@echo off
setlocal EnableExtensions

pushd "%~dp0" || exit /b 1

set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON=py -3"
if not defined PYTHON (
    where python >nul 2>&1
    if not errorlevel 1 set "PYTHON=python"
)
if not defined PYTHON (
    echo [ERROR] Python 3 was not found.
    popd
    exit /b 1
)

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'"`) do set "STAMP=%%I"
set "BACKUP_DIR=..\backups\generated\%STAMP%"

echo [1/7] Validating effect schema...
call %PYTHON% "validate-effect-schema.py" --input "trickcal_datasheet.xlsx"
if errorlevel 1 goto :validation_error

echo [2/7] Backing up current data...
mkdir "%BACKUP_DIR%" >nul 2>&1
if errorlevel 1 goto :backup_error

call :backup "..\apostles.js" || goto :backup_error
call :backup "..\cards.js" || goto :backup_error
call :backup "..\statData.js" || goto :backup_error
call :backup "trickcal_datasheet.xlsx" || goto :backup_error

echo [3/7] Generating apostles.js...
call %PYTHON% "generate-apostles.py" --input "trickcal_datasheet.xlsx" --output "..\apostles.js"
if errorlevel 1 goto :generate_error

echo [4/7] Generating cards.js...
call %PYTHON% "generate-card-data.py" --input "trickcal_datasheet.xlsx" --output "..\cards.js" --key-map "card-effect-key-map.tsv"
if errorlevel 1 goto :generate_error

echo [5/7] Generating statData.js...
call %PYTHON% "generate-stat-data.py" --input "trickcal_datasheet.xlsx" --output "..\statData.js"
if errorlevel 1 goto :generate_error

echo [6/7] Validating generated data...
node "validate-generated-data.js"
if errorlevel 1 goto :generate_error

echo [7/7] Complete.
echo Backup: %BACKUP_DIR%
popd
exit /b 0

:backup
if not exist "%~1" (
    echo [ERROR] Backup source was not found: %~1
    exit /b 1
)
copy /y "%~1" "%BACKUP_DIR%\%~nx1" >nul
if errorlevel 1 exit /b 1
exit /b 0

:backup_error
echo [ERROR] Backup failed. Generation was not started.
echo Backup: %BACKUP_DIR%
popd
exit /b 1

:validation_error
echo [ERROR] Datasheet validation failed. Generation was not started.
popd
exit /b 1

:generate_error
echo [ERROR] Generation failed. Existing files are available in:
echo %BACKUP_DIR%
popd
exit /b 1
