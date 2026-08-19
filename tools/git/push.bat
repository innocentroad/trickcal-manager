@echo off
setlocal EnableExtensions DisableDelayedExpansion

if /I "%~1"=="--help" goto :help
if /I "%~1"=="-h" goto :help

set "MODE=push"
set "MESSAGE="
if /I "%~1"=="--commit" (
    set "MODE=commit"
    set "MESSAGE=%~2"
) else if /I "%~1"=="-c" (
    set "MODE=commit"
    set "MESSAGE=%~2"
) else if not "%~1"=="" (
    echo [ERROR] Unknown option: %~1
    goto :help_error
)

pushd "%~dp0..\.." || goto :directory_error

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :repository_error

for /f "usebackq delims=" %%I in (`git branch --show-current`) do set "BRANCH=%%I"
if not defined BRANCH goto :branch_error

echo Repository: %CD%
echo Branch:     %BRANCH%
echo.
git status --short
if errorlevel 1 goto :status_error

if /I "%MODE%"=="commit" call :commit_changes
if errorlevel 1 goto :commit_error

echo.
echo Pushing %BRANCH%...
git rev-parse --abbrev-ref --symbolic-full-name "@{upstream}" >nul 2>&1
if errorlevel 1 (
    git push --set-upstream origin "%BRANCH%"
) else (
    git push
)
if errorlevel 1 goto :push_error

echo.
echo [OK] Push completed.
popd
exit /b 0

:commit_changes
if not defined MESSAGE set /p "MESSAGE=Commit message: "
if not defined MESSAGE (
    echo [ERROR] Commit message is required.
    exit /b 1
)

echo.
echo Staging all non-ignored changes...
git add -A
if errorlevel 1 exit /b 1

git diff --cached --check
if errorlevel 1 exit /b 1

git diff --cached --quiet
if not errorlevel 1 (
    echo No changes to commit. Continuing with push only.
    exit /b 0
)

git commit -m "%MESSAGE%"
exit /b %ERRORLEVEL%

:help
echo Usage:
echo   tools\git\push.bat
echo       Push already committed changes on the current branch.
echo.
echo   tools\git\push.bat --commit "commit message"
echo   tools\git\push.bat -c "commit message"
echo       Stage all non-ignored changes, commit them, then push.
exit /b 0

:help_error
call :help
exit /b 2

:directory_error
echo [ERROR] Could not open the repository directory.
exit /b 1

:repository_error
echo [ERROR] This script is not inside a Git repository.
popd
exit /b 1

:branch_error
echo [ERROR] Detached HEAD is not supported. Switch to a branch first.
popd
exit /b 1

:status_error
echo [ERROR] Could not read Git status.
popd
exit /b 1

:commit_error
echo [ERROR] Commit was not completed. Push was cancelled.
popd
exit /b 1

:push_error
echo [ERROR] Push failed. The local commit, if any, remains available.
popd
exit /b 1
