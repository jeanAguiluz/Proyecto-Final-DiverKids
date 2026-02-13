import os
from datetime import datetime


class GoogleCalendarService:
    """Servicio opcional para sincronizar eventos en Google Calendar."""

    SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

    def __init__(self):
        self.enabled = os.environ.get("GOOGLE_CALENDAR_ENABLED", "false").lower() == "true"
        self.calendar_id = os.environ.get("GOOGLE_CALENDAR_ID", "diverkidsinfo@gmail.com")
        self.timezone = os.environ.get("GOOGLE_CALENDAR_TIMEZONE", "America/Santiago")
        self.credentials_file = os.environ.get("GOOGLE_CALENDAR_CREDENTIALS", "credentials.json")
        self.token_file = os.environ.get("GOOGLE_CALENDAR_TOKEN", "token.json")

    def _build_service(self):
        """Construye cliente de Calendar API usando token OAuth existente."""
        if not self.enabled:
            return None

        try:
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
        except Exception as error:
            print(f"⚠️ Google Calendar libs no disponibles: {error}")
            return None

        creds = None
        token_path = self.token_file
        if not os.path.isabs(token_path):
            token_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), token_path)

        if os.path.exists(token_path):
            try:
                creds = Credentials.from_authorized_user_file(token_path, self.SCOPES)
            except Exception as error:
                print(f"⚠️ No se pudo leer token de Google Calendar: {error}")
                creds = None

        if not creds:
            print("⚠️ Google Calendar no sincronizado: falta token OAuth.")
            return None

        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(token_path, "w", encoding="utf-8") as token_file:
                    token_file.write(creds.to_json())
            except Exception as error:
                print(f"⚠️ No se pudo refrescar token de Google Calendar: {error}")
                return None

        try:
            return build("calendar", "v3", credentials=creds, cache_discovery=False)
        except Exception as error:
            print(f"⚠️ No se pudo inicializar Google Calendar API: {error}")
            return None

    def create_event(self, summary, description, start_dt, end_dt, location=""):
        """Crea evento en Google Calendar. No lanza excepción hacia rutas."""
        service = self._build_service()
        if not service:
            return {"ok": False, "reason": "calendar_not_configured"}

        if not isinstance(start_dt, datetime) or not isinstance(end_dt, datetime):
            return {"ok": False, "reason": "invalid_datetime"}

        body = {
            "summary": summary,
            "description": description or "",
            "location": location or "",
            "start": {
                "dateTime": start_dt.isoformat(),
                "timeZone": self.timezone,
            },
            "end": {
                "dateTime": end_dt.isoformat(),
                "timeZone": self.timezone,
            },
        }

        try:
            created = service.events().insert(calendarId=self.calendar_id, body=body).execute()
            print(f"✅ Evento creado en Google Calendar: {created.get('id')}")
            return {
                "ok": True,
                "id": created.get("id"),
                "htmlLink": created.get("htmlLink"),
            }
        except Exception as error:
            print(f"⚠️ Error creando evento en Google Calendar: {error}")
            return {"ok": False, "reason": str(error)}


google_calendar_service = GoogleCalendarService()

