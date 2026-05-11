@echo off
start "ngrok-backend" "%APPDATA%\npm\node_modules\ngrok\bin\ngrok.exe" http 8000 --host-header=localhost:8000 --log=stdout
