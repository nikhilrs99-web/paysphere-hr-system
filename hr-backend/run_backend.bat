@echo off
setlocal

:: Hardcoded Java path found in the environment
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo [ERROR] Java not found at %JAVA_HOME%
    echo Attempting to detect Java...
    for /f "delims=" %%i in ('where java 2^>nul') do set "JAVA_BIN=%%i"
    if not "%JAVA_BIN%"=="" (
        for /f "delims=" %%j in ("%JAVA_BIN%") do set "JAVA_HOME=%%~dpj"
        set "JAVA_HOME=%JAVA_HOME:~0,-5%"
        echo Detected JAVA_HOME: %JAVA_HOME%
    ) else (
        echo [ERROR] Could not find Java. Please ensure it is installed.
        pause
        exit /b 1
    )
)

echo Using JAVA_HOME: %JAVA_HOME%
echo Starting Backend...
call mvnw.cmd spring-boot:run
pause
