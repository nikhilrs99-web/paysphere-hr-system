# setup_mvnw.ps1
$MVNW_DIR = ".mvn/wrapper"
if (!(Test-Path $MVNW_DIR)) {
    New-Item -ItemType Directory -Force -Path $MVNW_DIR
}

Invoke-WebRequest -Uri "https://raw.githubusercontent.com/takari/maven-wrapper/master/.mvn/wrapper/maven-wrapper.properties" -OutFile "$MVNW_DIR/maven-wrapper.properties"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/takari/maven-wrapper/master/.mvn/wrapper/MavenWrapperDownloader.java" -OutFile "$MVNW_DIR/MavenWrapperDownloader.java"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw.cmd" -OutFile "mvnw.cmd"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw" -OutFile "mvnw"

Write-Host "Maven Wrapper files downloaded. You can now run the backend with: ./mvnw spring-boot:run" -ForegroundColor Green
