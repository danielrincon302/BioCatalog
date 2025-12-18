<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - {{ $appName }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 20px 0;
        }
        .user-info {
            background-color: #f0fdf4;
            border-left: 4px solid #16a34a;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .user-info p {
            margin: 5px 0;
        }
        .user-info strong {
            color: #166534;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background-color: #16a34a;
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
        }
        .button:hover {
            background-color: #15803d;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
        }
        .warning strong {
            color: #b45309;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        .link-fallback {
            word-break: break-all;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $appName }}</h1>
            <p style="color: #666; margin-top: 10px;">Sistema de Catálogo de Biodiversidad</p>
        </div>

        <div class="content">
            <h2 style="color: #333;">Hola {{ $user->name }},</h2>

            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en {{ $appName }}.</p>

            <div class="user-info">
                <p><strong>Información de tu cuenta:</strong></p>
                <p><strong>Usuario:</strong> {{ $user->email }}</p>
                <p><strong>Nombre:</strong> {{ $user->name }}</p>
                <p><strong>Zona:</strong> {{ $zoneName }}</p>
                <p><strong>Rol:</strong> {{ $roleName }}</p>
            </div>

            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">Restablecer Contraseña</a>
            </div>

            <div class="warning">
                <strong>Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este enlace expirará en <strong>1 hora</strong>.</li>
                    <li>Si no solicitaste este cambio, puedes ignorar este correo.</li>
                    <li>Tu contraseña actual permanecerá sin cambios hasta que crees una nueva.</li>
                </ul>
            </div>

            <p class="link-fallback">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                <a href="{{ $resetUrl }}" style="color: #16a34a;">{{ $resetUrl }}</a>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
