"""
Servicio de Email usando SendGrid
Maneja envío de emails de confirmación, recuperación de contraseña, etc.
"""
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

class EmailService:
    """Servicio para enviar emails usando SendGrid"""
    
    def __init__(self):
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        self.from_email = os.environ.get('SENDGRID_FROM_EMAIL')
        self.from_name = os.environ.get('SENDGRID_FROM_NAME')
        
        if not self.api_key:
            print("⚠️  SENDGRID_API_KEY no configurada. Los emails no se enviarán.")
            self.client = None
        else:
            self.client = SendGridAPIClient(self.api_key)
    
    def send_email(self, to_email, subject, html_content, text_content=None):
        """
        Enviar email genérico
        
        Args:
            to_email (str): Email del destinatario
            subject (str): Asunto del email
            html_content (str): Contenido HTML del email
            text_content (str): Contenido en texto plano (opcional)
        
        Returns:
            bool: True si se envió correctamente, False si hubo error
        """
        if not self.client:
            print(f"❌ No se puede enviar email a {to_email} - SendGrid no configurado")
            return False
        if not self.from_email:
            print("❌ SENDGRID_FROM_EMAIL no configurado")
            return False
        
        try:
            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            if text_content:
                message.content = [
                    Content("text/plain", text_content),
                    Content("text/html", html_content)
                ]
            
            response = self.client.send(message)
            
            if response.status_code == 202:
                print(f"✅ Email enviado a {to_email}")
                return True
            else:
                print(f"⚠️  Error al enviar email: {response.status_code}")
                try:
                    print(f"⚠️  Response body: {response.body}")
                except Exception:
                    pass
                return False
                
        except Exception as e:
            print(f"❌ Error al enviar email: {str(e)}")
            return False
    
    def send_welcome_email(self, user_email, user_name):
        """Enviar email de bienvenida a nuevo usuario"""
        subject = "¡Bienvenido a DiverKids! 🎉"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">¡Bienvenido a DiverKids!</h1>
                </div>
                <div style="padding: 40px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hola {user_name},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Gracias por registrarte en DiverKids. Estamos emocionados de ser parte de las celebraciones 
                        especiales de tu familia.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        Con tu cuenta puedes:
                    </p>
                    <ul style="color: #666; line-height: 1.8;">
                        <li>Reservar paquetes de animación</li>
                        <li>Rentar disfraces para tus eventos</li>
                        <li>Gestionar tus reservas</li>
                        <li>Ver el historial de tus eventos</li>
                    </ul>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}" 
                           style="background-color: #667eea; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Explorar Servicios
                        </a>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p>© 2024 DiverKids. Todos los derechos reservados.</p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Hola {user_name},
        
        ¡Bienvenido a DiverKids!
        
        Gracias por registrarte. Con tu cuenta puedes reservar paquetes de animación, 
        rentar disfraces y gestionar tus eventos.
        
        Visítanos en: {os.environ.get('FRONTEND_URL', 'http://localhost:5173')}
        
        Saludos,
        El equipo de DiverKids
        """
        
        return self.send_email(user_email, subject, html_content, text_content)
    
    def send_booking_confirmation(self, booking, user):
        """Enviar confirmación de reserva"""
        subject = f"Confirmación de Reserva - {booking.event_date}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #4CAF50; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">¡Reserva Confirmada! ✅</h1>
                </div>
                <div style="padding: 40px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hola {user.name},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:
                    </p>
                    <div style="background: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <p><strong>Fecha del evento:</strong> {booking.event_date}</p>
                        <p><strong>Hora:</strong> {booking.event_time or 'Por confirmar'}</p>
                        <p><strong>Ubicación:</strong> {booking.event_location or 'Por confirmar'}</p>
                        <p><strong>Tipo de servicio:</strong> {booking.booking_type}</p>
                        <p><strong>Total:</strong> ${booking.total_price}</p>
                    </div>
                    <p style="color: #666; line-height: 1.6;">
                        Nos pondremos en contacto contigo pronto para confirmar los detalles finales.
                    </p>
                </div>
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p>© 2024 DiverKids. Todos los derechos reservados.</p>
                </div>
            </body>
        </html>
        """
        
        return self.send_email(user.email, subject, html_content)
    
    def send_password_reset(self, user_email, reset_token):
        """Enviar email de recuperación de contraseña"""
        subject = "Recuperación de Contraseña - DiverKids"
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #FF9800; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Recuperación de Contraseña</h1>
                </div>
                <div style="padding: 40px; background-color: #f9f9f9;">
                    <p style="color: #666; line-height: 1.6;">
                        Recibimos una solicitud para restablecer tu contraseña. 
                        Haz clic en el botón de abajo para crear una nueva contraseña:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" 
                           style="background-color: #FF9800; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px;">
                        Este enlace expirará en 1 hora. Si no solicitaste este cambio, 
                        ignora este email.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        {reset_link}
                    </p>
                </div>
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p>© 2024 DiverKids. Todos los derechos reservados.</p>
                </div>
            </body>
        </html>
        """
        
        return self.send_email(user_email, subject, html_content)
    
    def send_contact_notification(self, contact):
        """Enviar notificación de nuevo mensaje de contacto al admin"""
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@diverkids.com')
        subject = f"Nuevo mensaje de contacto - {contact.name}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2196F3; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Nuevo Mensaje de Contacto</h1>
                </div>
                <div style="padding: 40px; background-color: #f9f9f9;">
                    <div style="background: white; padding: 20px; border-left: 4px solid #2196F3;">
                        <p><strong>Nombre:</strong> {contact.name}</p>
                        <p><strong>Email:</strong> {contact.email}</p>
                        <p><strong>Teléfono:</strong> {contact.phone or 'No proporcionado'}</p>
                        <p><strong>Mensaje:</strong></p>
                        <p style="padding: 15px; background: #f5f5f5; border-radius: 5px;">
                            {contact.message}
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return self.send_email(admin_email, subject, html_content)


# Instancia global del servicio
email_service = EmailService()
