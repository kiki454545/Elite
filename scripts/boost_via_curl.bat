@echo off
echo ============================================================
echo BOOST DES ANNONCES ET CREATION D'UTILISATEURS VIA CURL
echo ============================================================
echo.

REM Premier appel: Boost des annonces
echo Etape 1/2: Boost des annonces actives...
curl -X POST "https://nzrptauexzttqhmnhhgd.supabase.co/rest/v1/rpc/boost_active_ads" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgzNDg1NSwiZXhwIjoyMDU4NDEwODU1fQ.sw6vPi-OXO9sh9TubYLeEC_zomqKcZXrfAhLKdAtEMY" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgzNDg1NSwiZXhwIjoyMDU4NDEwODU1fQ.sw6vPi-OXO9sh9TubYLeEC_zomqKcZXrfAhLKdAtEMY" ^
  -H "Content-Type: application/json"
echo.
echo.

REM Deuxieme appel: Creation des utilisateurs
echo Etape 2/2: Creation de 3546 nouveaux utilisateurs...
curl -X POST "https://nzrptauexzttqhmnhhgd.supabase.co/rest/v1/rpc/create_new_users" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgzNDg1NSwiZXhwIjoyMDU4NDEwODU1fQ.sw6vPi-OXO9sh9TubYLeEC_zomqKcZXrfAhLKdAtEMY" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgzNDg1NSwiZXhwIjoyMDU4NDEwODU1fQ.sw6vPi-OXO9sh9TubYLeEC_zomqKcZXrfAhLKdAtEMY" ^
  -H "Content-Type: application/json"
echo.
echo.

echo ============================================================
echo TERMINE!
echo ============================================================
pause
