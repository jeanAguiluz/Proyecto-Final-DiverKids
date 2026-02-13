from app import create_app
from models import db, User, Costume, AnimationPackage

# Crear la aplicación
app = create_app()

# Ejecutar dentro del contexto de la aplicación
with app.app_context():
    print("🔄 Iniciando seed de la base de datos...\n")
    
    # ====================================
    # CREAR/ACTUALIZAR USUARIO ADMIN
    # ====================================
    
    # Eliminar admin anterior si existe con email diferente
    old_admin = User.query.filter_by(email='admin@diverkids.com').first()
    if old_admin:
        db.session.delete(old_admin)
        db.session.commit()
        print("🗑️  Usuario admin anterior eliminado")
    
    # Crear o actualizar admin con nuevo email
    admin = User.query.filter_by(email='diverkidsinfo@gmail.com').first()
    if not admin:
        admin = User(
            name='Admin DiverKids',
            email='diverkidsinfo@gmail.com',
            phone='+56954839845',
            role='admin'
        )
        admin.password = 'DiverKids2026!'  # El setter hace el hash automáticamente
        db.session.add(admin)
        db.session.commit()
        print("✅ Usuario admin creado")
    else:
        # Actualizar contraseña y asegurar que sea admin
        admin.password = 'DiverKids2026!'
        admin.role = 'admin'
        admin.name = 'Admin DiverKids'
        admin.phone = '+56954839845'
        db.session.commit()
        print("✅ Contraseña del admin actualizada")
    
    # ====================================
    # CREAR DISFRACES DE PRUEBA
    # ====================================
    
    # Verificar si ya existen
    costume1 = Costume.query.filter_by(name='Spider-Man').first()
    if not costume1:
        costume1 = Costume(
            name="Spider-Man",
            description="Disfraz completo de Spider-Man con máscara",
            category="Superhéroes",
            size="M",
            price_per_day=15000,
            image_url="https://via.placeholder.com/300x400/667eea/ffffff?text=Spider-Man",
            available=True,
            stock_quantity=3
        )
        db.session.add(costume1)
        print("✅ Disfraz Spider-Man creado")
    else:
        print("ℹ️  Disfraz Spider-Man ya existe")
    
    costume2 = Costume.query.filter_by(name='Elsa de Frozen').first()
    if not costume2:
        costume2 = Costume(
            name="Elsa de Frozen",
            description="Vestido de princesa Elsa con accesorios",
            category="Princesas",
            size="S",
            price_per_day=18000,
            image_url="https://via.placeholder.com/300x400/764ba2/ffffff?text=Elsa",
            available=True,
            stock_quantity=2
        )
        db.session.add(costume2)
        print("✅ Disfraz Elsa de Frozen creado")
    else:
        print("ℹ️  Disfraz Elsa de Frozen ya existe")
    
    # ====================================
    # CREAR PAQUETES DE ANIMACIÓN
    # ====================================
    
    package1 = AnimationPackage.query.filter_by(name='Fiesta Básica').first()
    if not package1:
        package1 = AnimationPackage(
            name="Fiesta Básica",
            description="Paquete ideal para fiestas pequeñas",
            duration_hours=2,
            price=50000,
            includes="Animador, juegos, música, piñata",
            max_children=15,
            image_url="https://via.placeholder.com/400x300/f093fb/ffffff?text=Fiesta+Basica",
            available=True
        )
        db.session.add(package1)
        print("✅ Paquete Fiesta Básica creado")
    else:
        print("ℹ️  Paquete Fiesta Básica ya existe")
    
    package2 = AnimationPackage.query.filter_by(name='Fiesta Premium').first()
    if not package2:
        package2 = AnimationPackage(
            name="Fiesta Premium",
            description="La fiesta más completa para tu celebración",
            duration_hours=3,
            price=80000,
            includes="2 animadores, juegos, música, piñata, show de magia, globoflexia",
            max_children=25,
            image_url="https://via.placeholder.com/400x300/667eea/ffffff?text=Fiesta+Premium",
            available=True
        )
        db.session.add(package2)
        print("✅ Paquete Fiesta Premium creado")
    else:
        print("ℹ️  Paquete Fiesta Premium ya existe")
    
    package3 = AnimationPackage.query.filter_by(name='Fiesta VIP').first()
    if not package3:
        package3 = AnimationPackage(
            name="Fiesta VIP",
            description="Experiencia inolvidable con todo incluido",
            duration_hours=4,
            price=120000,
            includes="3 animadores, juegos, música, piñata, show de magia, globoflexia, personaje infantil, decoración temática",
            max_children=40,
            image_url="https://via.placeholder.com/400x300/764ba2/ffffff?text=Fiesta+VIP",
            available=True
        )
        db.session.add(package3)
        print("✅ Paquete Fiesta VIP creado")
    else:
        print("ℹ️  Paquete Fiesta VIP ya existe")
    
    # Guardar todos los cambios
    db.session.commit()
    
    # ====================================
    # RESUMEN FINAL
    # ====================================
    
    print("\n" + "="*50)
    print("🎉 Seed completado exitosamente")
    print("="*50)
    print(f"📊 Total usuarios:  {User.query.count()}")
    print(f"📊 Total disfraces: {Costume.query.count()}")
    print(f"📊 Total paquetes:  {AnimationPackage.query.count()}")
    print("="*50)
    print("\n📋 CREDENCIALES DE ACCESO:")
    print("-" * 50)
    print("🔑 Email:    diverkidsinfo@gmail.com")
    print("🔑 Password: DiverKids2026!")
    print("-" * 50)
    print("\n✅ Puedes iniciar sesión en: http://localhost:5173/login\n")