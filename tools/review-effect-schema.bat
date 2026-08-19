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

set "EXPORT_DIR=..\tmp\effect-schema-source"
set "REVIEW_DIR=..\tmp\effect-schema-review"

echo [1/3] Exporting current datasheet...
call %PYTHON% "export-datasheet-tsv.py" --input "trickcal_datasheet.xlsx" --output-dir "%EXPORT_DIR%"
if errorlevel 1 goto :error

echo [2/3] Creating structured-column candidates...
call %PYTHON% "convert-effect-runtime-columns.py" --input-dir "%EXPORT_DIR%" --output-dir "%REVIEW_DIR%"
if errorlevel 1 goto :error

echo [3/3] Complete.
echo Review: %REVIEW_DIR%
popd
exit /b 0

:error
echo [ERROR] Effect schema review generation failed.
popd
exit /b 1
