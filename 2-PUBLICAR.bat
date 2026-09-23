@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tutora - publicar alteracoes

echo.
echo  =====================================================
echo    TUTORA - PUBLICAR AS ALTERACOES NO SITE
echo  =====================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo  O Git nao esta instalado. Rode antes o 1-CONFIGURAR-PRIMEIRA-VEZ.bat
  pause
  exit /b 1
)
if not exist ".git" (
  echo  Esta pasta ainda nao esta ligada ao GitHub.
  echo  Rode antes o 1-CONFIGURAR-PRIMEIRA-VEZ.bat
  pause
  exit /b 1
)

rem ---- O Git arruma a pasta .git sozinho de vez em quando. No Windows, OneDrive,
rem ---- Dropbox ou antivirus prendem essas pastas e ele fica perguntando
rem ---- "Should I try again? y/n". Desligamos a arrumacao automatica e a pergunta,
rem ---- e tambem os avisos inofensivos de LF/CRLF.
set "GIT_ASK_YESNO=false"
rem ---- Sem paginador: listas longas nao param a janela em "(END)".
git config core.pager ""
git config gc.auto 0
git config maintenance.auto false
git config core.safecrlf false

git add -A
git diff --cached --quiet
if errorlevel 1 (
  echo  Arquivos alterados:
  git --no-pager diff --cached --name-status
  echo.
  set "MSG="
  set /p "MSG= Descreva a alteracao em poucas palavras (ou so Enter): "
  if not defined MSG set "MSG=Atualizacao do site em %date% %time:~0,5%"
  git commit -m "!MSG!" >nul
) else (
  echo  Nenhuma alteracao nova nos arquivos.
)

echo.
echo  Buscando alteracoes feitas direto no GitHub (se houver)...
git pull --rebase --autostash origin main
if errorlevel 1 (
  echo.
  echo  Houve um conflito entre o que esta no GitHub e o que esta aqui.
  echo  Nada foi perdido. Peca ajuda antes de continuar.
  pause
  exit /b 1
)

echo.
echo  Enviando para o GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo  O envio falhou. Confira a internet e o login no GitHub e tente de novo.
  pause
  exit /b 1
)

set "URL="
for /f "delims=" %%u in ('git remote get-url origin') do set "URL=%%u"
if /i "!URL:~-4!"==".git" set "URL=!URL:~0,-4!"
echo.
echo  =====================================================
echo    ENVIADO! O GitHub publica em 1 a 2 minutos.
echo  =====================================================
echo    Acompanhe em: !URL!/actions
echo    Bolinha verde = publicado. X vermelho = abra o item e leia a
echo    mensagem do "Conferir o conteudo" (ela diz o que corrigir).
echo.
start "" "!URL!/actions"
pause
