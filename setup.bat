@echo off
echo --- CareerPilot Setup ---

:: Docker images (first run)
if not exist .docker_images_built (
    echo First-time setup: building Docker images...
    docker-compose build
    if %ERRORLEVEL% EQU 0 (
        echo 1>.docker_images_built
        echo Docker images built successfully.
    ) else (
        echo Docker build failed. You can run "docker-compose build" manually.
    )
) else (
    echo Docker images already built. Skipping docker build.
)

:: Backend
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing backend dependencies...
    pip install -r requirements.txt
) else (
    echo Backend venv already exists. Skipping install.
)
cd ..

:: Frontend
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
) else (
    echo Frontend node_modules already exists. Skipping install.
)
cd ..

echo --- Setup Complete ---
pause
