# 0. Docker 네트워크 사전 확인/생성
# docker-compose에서 외부 네트워크를 참조할 때 에러가 나므로 미리 생성 시도
# docker network create traefik-public 2>$null

# ====================================================================
Write-Host "Starting Java dependencies install..." -ForegroundColor Cyan
Push-Location .\backend
  ./gradlew clean build -x test
  ./gradlew bootJar
Pop-Location
  docker compose -f .\compose.local.yaml build --no-cache rc-backend

# ====================================================================
# Write-Host "Starting Python dependencies install..." -ForegroundColor Cyan
# Push-Location .\analysis

#   # 가상환경이 없는 경우에만 새로 생성
#   if (-not (Test-Path ".\venv")) {
#       python -m venv venv
#   }
#   # 확실하게 가상환경 내부 pip 호출하여 lib 폴더에 패키지 설치
#   .\venv\Scripts\pip.exe install --target=.\lib -r requirements.txt
# Pop-Location
#   docker compose -f .\compose.local.yaml build --no-cache python

# ====================================================================
# Write-Host "Starting Front dependencies install..." -ForegroundColor Cyan
# # \front 가 아니라 .\front 로 수정하여 상대 경로 지정
# Push-Location .\front
#   npm install
#   npm run build
# Pop-Location
#   docker compose -f .\compose.local.yaml build --no-cache front