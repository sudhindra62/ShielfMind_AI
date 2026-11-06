# ShelfMind AI Backend

FastAPI + SQLite backend for the local-first Retail Decision Co-Pilot.

## Run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -B -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs`.

The SQLite database is created automatically and seeded with 90 days of demo data on first startup.
By default, runtime files are stored in your OS temp directory under `shelfmind-ai`.
Set `SHELFMIND_DATA_DIR` to choose a custom local database/upload directory.
