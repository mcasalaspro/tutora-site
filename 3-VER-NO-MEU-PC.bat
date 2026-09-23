@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Tutora - ver o site no meu computador

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Para ver o site no seu computador antes de publicar, instale o Node.js
  echo  (versao LTS). Vou abrir a pagina de download.
  echo  Depois de instalar, rode este arquivo de novo.
  start "" "https://nodejs.org/pt"
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo.
  echo  Preparando (so na primeira vez, leva uns minutos)...
  call npm install
  if errorlevel 1 (
    echo  A instalacao falhou. Confira a internet e tente de novo.
    pause
    exit /b 1
  )
)

echo.
call npm run verificar
if errorlevel 1 (
  echo  Corrija os erros acima antes de publicar.
  pause
  exit /b 1
)

echo.
echo  Abrindo o site em http://localhost:4321
echo  As alteracoes nos arquivos aparecem sozinhas no navegador.
echo  Para parar, feche esta janela.
echo.
call npx astro dev --open
pause
