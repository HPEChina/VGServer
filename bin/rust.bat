@echo off
for /f "delims=" %%v in ('node -v') do (
    nvm install 7.6.0 
    nvm use 7.6.0 && npm run rust
    nvm use %%v
)
