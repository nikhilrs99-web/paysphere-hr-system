@echo off
setlocal

:: Hardcoded Java path that is known to exist on this machine
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo [ERROR] Java not found at %JAVA_HOME%
    pause
    exit /b 1
)

echo Using JAVA_HOME: %JAVA_HOME%
echo Starting Backend with SUPABASE (Production) Profile...
call mvnw.cmd spring-boot:run
pause
