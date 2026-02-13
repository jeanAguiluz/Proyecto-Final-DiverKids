"""
Genera token OAuth para Google Calendar (uso local).
1) Descarga credentials.json desde Google Cloud (OAuth Client ID - Desktop app)
2) Ejecuta este script
3) Inicia sesión con la cuenta diverkidsinfo@gmail.com
4) Guarda token.json en esta carpeta
"""
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def main():
    base_dir = Path(__file__).resolve().parent
    credentials_path = base_dir / "credentials.json"
    token_path = base_dir / "token.json"

    if not credentials_path.exists():
        print("❌ No se encontró credentials.json en src/backend")
        return

    flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), SCOPES)
    creds = flow.run_local_server(port=0)

    token_path.write_text(creds.to_json(), encoding="utf-8")
    print(f"✅ Token generado en: {token_path}")


if __name__ == "__main__":
    main()

