@echo off
setlocal
echo Creating Maven Wrapper directories...
if not exist ".mvn\wrapper" mkdir ".mvn\wrapper"

echo Downloading maven-wrapper.properties...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/takari/maven-wrapper/master/.mvn/wrapper/maven-wrapper.properties' -OutFile '.mvn/wrapper/maven-wrapper.properties'"

echo Downloading MavenWrapperDownloader.java...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/takari/maven-wrapper/master/.mvn/wrapper/MavenWrapperDownloader.java' -OutFile '.mvn/wrapper/MavenWrapperDownloader.java'"

echo Downloading mvnw.cmd...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw.cmd' -OutFile 'mvnw.cmd'"

echo Downloading mvnw (bash script)...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw' -OutFile 'mvnw'"

echo.
echo Maven Wrapper files downloaded successfully.
echo You can now run the backend with: mvnw spring-boot:run
pause
