# MailShield Radar

Aplicacion web estatica para revisar controles DNS de correo:

- SPF en el dominio raiz.
- DMARC en `_dmarc`.
- DKIM mediante diccionario de selectores comunes y selectores extra.
- MX, MTA-STS, TLS-RPT y BIMI.

DKIM no permite enumerar todos los selectores desde DNS: cada selector es una etiqueta arbitraria. La app prueba una lista comun y permite agregar selectores propios.

## Ejecutar localmente

Abre `index.html` en el navegador. Si el navegador bloquea alguna consulta por origen local, levanta un servidor estatico:

```bash
python3 -m http.server 8080
```

Y abre `http://localhost:8080`.

## Privacidad

Las consultas DNS se hacen desde el navegador hacia Google DNS o Cloudflare DNS usando DNS-over-HTTPS. No hay backend ni base de datos en este proyecto.
