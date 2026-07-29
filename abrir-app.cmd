@echo off
cd /d "%~dp0"
echo Iniciando o sistema ComSoc com a base de migracao local...
call npm.cmd run dev
