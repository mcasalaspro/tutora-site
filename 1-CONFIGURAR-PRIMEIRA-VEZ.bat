@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tutora - configurar a publicacao (primeira vez)

echo.
echo  =====================================================
echo    TUTORA - CONFIGURAR A PUBLICACAO (so na 1a vez)
echo  =====================================================
echo.

rem Nunca parar numa pergunta "Should I try again? y/n" do Git: responde nao sozinho.
set "GIT_ASK_YESNO=false"

where git >nul 2>nul
if errorlevel 1 (
  echo  O Git nao esta instalado neste computador.
  echo  Vou abrir a pagina de download. Instale com as opcoes padrao
  echo  e depois rode este arquivo de novo.
  start "" "https://git-scm.com/download/win"
  echo.
  pause
  exit /b 1
)

set "GITNOME="
set "GITEMAIL="
for /f "delims=" %%a in ('git config --global user.name 2^>nul') do set "GITNOME=%%a"
for /f "delims=" %%a in ('git config --global user.email 2^>nul') do set "GITEMAIL=%%a"
if not defined GITNOME (
  set /p "GITNOME= Seu nome (fica registrado nas alteracoes): "
  git config --global user.name "!GITNOME!"
)
if not defined GITEMAIL (
  set /p "GITEMAIL= Seu e-mail do GitHub: "
  git config --global user.email "!GITEMAIL!"
)

rem ---- 1. Endereco do repositorio -------------------------------------------
set "PADRAO=https://github.com/mcasalaspro/tutora-site"
echo.
echo  Repositorio do site no GitHub:
echo     !PADRAO!
echo  Se for esse, so aperte Enter. Se for outro, cole o endereco dele.
echo  (Para um repositorio novo, crie antes em https://github.com/new,
echo   vazio, Public, sem README.)
set "REPO="
set /p "REPO= Endereco: "
if not defined REPO set "REPO=!PADRAO!"
if "!REPO:~-1!"=="/" set "REPO=!REPO:~0,-1!"
if /i not "!REPO:~-4!"==".git" set "REPO=!REPO!.git"
set "PAGINA=!REPO:~0,-4!"

rem ---- 2. Liga esta pasta ao repositorio e registra os arquivos --------------
if not exist ".git" (
  git init >nul
  git symbolic-ref HEAD refs/heads/main
)
rem ---- O Git arruma a pasta .git sozinho de vez em quando. No Windows, OneDrive,
rem ---- Dropbox ou antivirus prendem essas pastas e ele fica perguntando
rem ---- "Should I try again? y/n". Desligamos a arrumacao automatica e a pergunta,
rem ---- e tambem os avisos inofensivos de LF/CRLF.
git config gc.auto 0
git config maintenance.auto false
git config core.safecrlf false
git remote remove origin >nul 2>nul
git remote add origin "!REPO!"
git add -A
git commit -m "Site novo do catalogo Tutora" >nul 2>nul
git branch -M main

rem ---- 3. Confere o que ja existe no GitHub ----------------------------------
echo.
echo  Conferindo o repositorio no GitHub...
echo  (se o GitHub pedir login, entre na janela que abrir)
set "LISTA=%TEMP%\tutora-repo.txt"
git ls-remote --symref origin HEAD > "!LISTA!"
if errorlevel 1 (
  echo.
  echo  Nao consegui acessar !PAGINA!
  echo  Confira o endereco e se voce entrou com a conta que tem acesso a ele.
  pause
  exit /b 1
)
set "ATUAL="
for /f "tokens=2" %%a in ('findstr /b /c:"ref:" "!LISTA!"') do set "ATUAL=%%a"
if defined ATUAL set "ATUAL=!ATUAL:refs/heads/=!"

set "SUBSTITUIR="
if defined ATUAL (
  git fetch -q origin "+refs/heads/!ATUAL!:refs/remotes/origin/!ATUAL!"
  git merge-base --is-ancestor "origin/!ATUAL!" main >nul 2>nul
  if errorlevel 1 set "SUBSTITUIR=1"
)

if defined SUBSTITUIR (
  echo.
  echo  =====================================================
  echo    ATENCAO: este repositorio ja tem outro site
  echo  =====================================================
  echo    Vou SUBSTITUIR todo o conteudo do repositorio pelo site novo.
  echo    Antes, guardo uma copia do conteudo atual no proprio GitHub,
  echo    num ramo chamado "site-antigo-DATA", para recuperar se precisar.
  echo.
  set "RESPOSTA="
  set /p "RESPOSTA= Para continuar, digite SIM e aperte Enter: "
  if /i not "!RESPOSTA!"=="SIM" (
    echo.
    echo  Tudo bem: nada foi alterado no GitHub.
    pause
    exit /b 1
  )
)

rem ---- 4. GitHub Pages: publicar pelo GitHub Actions --------------------------
echo.
echo  =====================================================
echo    Antes de enviar: ligue o GitHub Pages (uma vez)
echo  =====================================================
echo    1. Na pagina que vou abrir (Settings ^> Pages), em "Build and
echo       deployment", no campo "Source", escolha: GitHub Actions
echo       (se estiver "Deploy from a branch", troque).
echo    2. Se o site antigo tinha dominio proprio, deixe-o em "Custom domain".
echo    3. Volte para esta janela.
echo.
start "" "!PAGINA!/settings/pages"
pause

rem ---- 5. Envio ---------------------------------------------------------------
if defined SUBSTITUIR (
  set "DATA="
  for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmm"') do set "DATA=%%d"
  if not defined DATA set "DATA=copia"
  echo.
  echo  Guardando o conteudo atual no ramo site-antigo-!DATA! ...
  git push -q origin "refs/remotes/origin/!ATUAL!:refs/heads/site-antigo-!DATA!"
  if errorlevel 1 (
    echo  Nao consegui guardar a copia. Nada foi substituido.
    pause
    exit /b 1
  )
  echo  Enviando o site novo no lugar do antigo...
  git push -u origin main --force
) else (
  echo.
  echo  Enviando os arquivos para o GitHub...
  git push -u origin main
)
if errorlevel 1 (
  echo.
  echo  O GitHub recusou o envio. Causas mais comuns:
  echo    - a conta usada no login nao tem permissao de escrita no repositorio;
  echo    - o ramo main esta protegido: em Settings ^> Branches, desligue a regra
  echo      que bloqueia "force push" e rode este arquivo de novo.
  pause
  exit /b 1
)

rem ---- 6. Ramo principal precisa ser o main -----------------------------------
if defined ATUAL if /i not "!ATUAL!"=="main" (
  echo.
  echo  =====================================================
  echo    Falta um ajuste: o ramo principal era "!ATUAL!"
  echo  =====================================================
  echo    O site novo esta no ramo "main". Na pagina que vou abrir
  echo    em Settings ^> General, no campo "Default branch", troque para: main
  echo    Depois volte aqui e aperte uma tecla: eu reenvio para publicar.
  start "" "!PAGINA!/settings"
  pause
  git commit --allow-empty -m "Publicar o site" >nul
  git push origin main
)

echo.
echo  =====================================================
echo    PRONTO! O GitHub esta publicando o site novo.
echo  =====================================================
echo    Acompanhe em: !PAGINA!/actions
echo    Bolinha verde = publicado (1 a 2 minutos). O endereco do site
echo    aparece em Settings ^> Pages.
echo    Daqui em diante, para atualizar, use o 2-PUBLICAR.bat.
echo.
start "" "!PAGINA!/actions"
pause
