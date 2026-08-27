@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Initialize the log before pushd, Python discovery, or validation can fail.
set "TOOLS_DIR=%~dp0"
set "TMP_DIR=%~dp0..\tmp"
if not exist "%TMP_DIR%\" mkdir "%TMP_DIR%" >nul 2>&1
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss_fff'"`) do set "STAMP=%%I"
if not defined STAMP set "STAMP=%RANDOM%_%RANDOM%"
set "STAMP=%STAMP%_%RANDOM%"
set "ERROR_LOG=%TMP_DIR%\generate-error-%STAMP%.log"
set "CHANGE_LOG=%TMP_DIR%\generate-change-%STAMP%.log"
>"%ERROR_LOG%" echo Trickcal Manager generation log: %STAMP%
>>"%ERROR_LOG%" echo Started: %DATE% %TIME%
>>"%ERROR_LOG%" echo Script: %~f0
if not exist "%ERROR_LOG%" (
    set "ERROR_LOG=%TEMP%\trickcal-manager-generate-error-%STAMP%.log"
    >"!ERROR_LOG!" echo Trickcal Manager generation log: %STAMP%
    >>"!ERROR_LOG!" echo Started: %DATE% %TIME%
    >>"!ERROR_LOG!" echo Script: %~f0
)
if not exist "%ERROR_LOG%" (
    echo [ERROR] Failed to create error log in "%TMP_DIR%" or "%TEMP%".
    exit /b 1
)

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

set "BACKUP_DIR=%TOOLS_DIR%..\backups\generated\%STAMP%"

echo [1/7] Validating effect schema...
call :run_python "validate-effect-schema.py" --input "trickcal_datasheet.xlsx"
if errorlevel 1 goto :validation_error

echo [2/7] Backing up current data...
mkdir "%BACKUP_DIR%" >nul 2>&1
if errorlevel 1 goto :backup_error

call :backup "%TOOLS_DIR%..\apostles.js" || goto :backup_error
call :backup "%TOOLS_DIR%..\cards.js" || goto :backup_error
call :backup "%TOOLS_DIR%..\statData.js" || goto :backup_error
call :backup "%TOOLS_DIR%trickcal_datasheet.xlsx" || goto :backup_error

echo [3/7] Generating apostles.js...
call :run_python "generate-apostles.py" --input "trickcal_datasheet.xlsx" --output "%TOOLS_DIR%..\apostles.js"
if errorlevel 1 goto :generate_error

echo [4/7] Generating cards.js...
call :run_python "generate-card-data.py" --input "trickcal_datasheet.xlsx" --output "%TOOLS_DIR%..\cards.js" --key-map "card-effect-key-map.tsv"
if errorlevel 1 goto :generate_error

echo [5/7] Generating statData.js...
call :run_python "generate-stat-data.py" --input "trickcal_datasheet.xlsx" --output "%TOOLS_DIR%..\statData.js"
if errorlevel 1 goto :generate_error

echo [6/7] Validating generated data...
call :run_node "validate-generated-data.js"
if errorlevel 1 goto :generate_error

echo [7/8] Recording generated value changes...
call :run_python "generate-change-log.py" --previous-dir "%BACKUP_DIR%" --current-dir "%TOOLS_DIR%.." --output "%CHANGE_LOG%"
if errorlevel 1 (
    call :log_line [WARN] Failed to create generated value change log.
    echo [WARN] Failed to create generated value change log.
)
echo Change log: %CHANGE_LOG%
echo [8/8] Complete.
echo Backup: %BACKUP_DIR%
del /q "%ERROR_LOG%" >nul 2>&1
popd
exit /b 0

:run_python
call :log_line [RUN] %PYTHON% %*
%PYTHON% %* >>"%ERROR_LOG%" 2>&1
set "RUN_CODE=%ERRORLEVEL%"
if not "%RUN_CODE%"=="0" call :log_line [EXIT] %RUN_CODE%
exit /b %RUN_CODE%

:run_node
call :log_line [RUN] node %*
node %* >>"%ERROR_LOG%" 2>&1
set "RUN_CODE=%ERRORLEVEL%"
if not "%RUN_CODE%"=="0" call :log_line [EXIT] %RUN_CODE%
exit /b %RUN_CODE%

:backup
if not exist "%~1" (
    call :log_line [ERROR] Backup source was not found: %~1
    exit /b 1
)
copy /y "%~1" "%BACKUP_DIR%\%~nx1" >nul 2>&1
if errorlevel 1 (
    call :log_line [ERROR] Backup copy failed: %~1
    exit /b 1
)
exit /b 0

:log_line
>>"%ERROR_LOG%" echo %*
exit /b 0

:startup_error
call :log_line [ERROR] Generation startup failed.
call :report_log
if "%PUSHD_OK%"=="1" popd
exit /b 1

:backup_error
call :log_line [ERROR] Backup failed. Generation was not started.
echo [ERROR] Backup failed. Generation was not started.
echo Backup: %BACKUP_DIR%
call :report_log
popd
exit /b 1

:validation_error
call :log_line [ERROR] Datasheet validation failed. Generation was not started.
echo [ERROR] Datasheet validation failed. Generation was not started.
call :report_log
popd
exit /b 1

:generate_error
call :log_line [ERROR] Generation failed.
echo [ERROR] Generation failed. Existing files are available in:
echo %BACKUP_DIR%
call :report_log
popd
exit /b 1

:report_log
echo Error log: %ERROR_LOG%
if exist "%ERROR_LOG%" type "%ERROR_LOG%"
exit /b 0
