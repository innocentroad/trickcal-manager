@echo off
setlocal EnableExtensions

set "INPUT="
if not "%~1"=="" set "INPUT=%~f1"

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

if not defined INPUT set "INPUT=trickcal_skillmotion.xlsx"

echo Generating DPS timing data from "%INPUT%"...
call %PYTHON% "generate-dps-timing-data.py" --input "%INPUT%" --output "..\dps-timing-data.js"
if errorlevel 1 (
    echo [ERROR] DPS timing data generation failed.
    popd
    exit /b 1
)

echo Complete: ..\dps-timing-data.js
echo Future datasheet usage: generate-dps-timing-data.bat trickcal_datasheet.xlsx
popd
exit /b 0
