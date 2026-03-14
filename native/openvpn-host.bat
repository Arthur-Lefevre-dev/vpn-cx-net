@echo off
REM Wrapper for openvpn-host.js so Chrome can run it via Native Messaging.
REM Install: use scripts/install-native-host.js to register this host.
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%openvpn-host.js" %*
