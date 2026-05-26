@echo off
echo --- CareerPilot Setup ---

:: Backend
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing backend dependencies...
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
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
