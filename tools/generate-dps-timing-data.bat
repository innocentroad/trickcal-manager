@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Initialize the log before pushd, Python discovery, or input validation can fail.
set "TOOLS_DIR=%~dp0"
set "TMP_DIR=%~dp0..\tmp"
if not exist "%TMP_DIR%\" mkdir "%TMP_DIR%" >nul 2>&1
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss_fff'"`) do set "STAMP=%%I"
if not defined STAMP set "STAMP=%RANDOM%_%RANDOM%"
set "STAMP=%STAMP%_%RANDOM%"
set "ERROR_LOG=%TMP_DIR%\generate-dps-timing-error-%STAMP%.log"
>"%ERROR_LOG%" echo Trickcal DPS timing generation log: %STAMP%
>>"%ERROR_LOG%" echo Started: %DATE% %TIME%
>>"%ERROR_LOG%" echo Script: %~f0
if not exist "%ERROR_LOG%" (
    set "ERROR_LOG=%TEMP%\trickcal-manager-generate-dps-timing-error-%STAMP%.log"
    >"!ERROR_LOG!" echo Trickcal DPS timing generation log: %STAMP%
    >>"!ERROR_LOG!" echo Started: %DATE% %TIME%
    >>"!ERROR_LOG!" echo Script: %~f0
)
if not exist "%ERROR_LOG%" (
    echo [ERROR] Failed to create error log in "%TMP_DIR%" or "%TEMP%".
    exit /b 1
)

set "INPUT="
if not "%~1"=="" set "INPUT=%~f1"
if not defined INPUT set "INPUT=%TOOLS_DIR%trickcal_skillmotion.xlsx"

set "PUSHD_OK=0"
pushd "%TOOLS_DIR%" >nul 2>&1
if errorlevel 1 goto :startup_error
set "PUSHD_OK=1"

set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON=py -3"
if not defined PYTHON (
    where python >nul 2>&1
    if not errorlevel 1 set "PYTHON=python"
)
if not defined PYTHON (
    call :log_line [ERROR] Python 3 was not found.
    echo [ERROR] Python 3 was not found.
    goto :startup_error
)

echo Generating DPS timing data from "%INPUT%"...
call :run_python "generate-dps-timing-data.py" --input "%INPUT%" --output "%TOOLS_DIR%..\dps-timing-data.js"
if errorlevel 1 goto :generate_error

echo Complete: %TOOLS_DIR%..\dps-timing-data.js
echo Future datasheet usage: generate-dps-timing-data.bat trickcal_skillmotion.xlsx
del /q "%ERROR_LOG%" >nul 2>&1
popd
exit /b 0

:run_python
call :log_line [RUN] %PYTHON% %*
%PYTHON% %* >>"%ERROR_LOG%" 2>&1
set "RUN_CODE=%ERRORLEVEL%"
if not "%RUN_CODE%"=="0" call :log_line [EXIT] %RUN_CODE%
exit /b %RUN_CODE%

:log_line
>>"%ERROR_LOG%" echo %*
exit /b 0

:startup_error
call :log_line [ERROR] Generation startup failed.
call :report_log
if "%PUSHD_OK%"=="1" popd
exit /b 1

:generate_error
call :log_line [ERROR] DPS timing data generation failed.
echo [ERROR] DPS timing data generation failed.
call :report_log
popd
exit /b 1

:report_log
echo Error log: %ERROR_LOG%
if exist "%ERROR_LOG%" type "%ERROR_LOG%"
exit /b 0
