@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\google-p12-pem\build\src\bin\gp12-pem.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\google-p12-pem\build\src\bin\gp12-pem.js" %*
)