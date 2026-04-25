# MailShield Radar

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-0b7b83)](https://juguitos.github.io/mailshield-radar/)
[![Static App](https://img.shields.io/badge/app-static-2458a6)](#privacidad)
[![No Backend](https://img.shields.io/badge/backend-none-24724d)](#privacidad)

MailShield Radar es una aplicacion web estatica para revisar la postura DNS de correo de un dominio. Esta pensada para apoyar analisis comunitarios de SPF, DMARC, DKIM y controles complementarios sin usar backend ni base de datos.

Demo: https://juguitos.github.io/mailshield-radar/

## Funciones

- Revisa SPF en el dominio raiz.
- Revisa DMARC en `_dmarc`.
- Revisa DKIM en modo automatico o con selector especifico.
- Prueba selectores comunes y permite agregar selectores extra.
- Revisa MX, MTA-STS, TLS-RPT y BIMI.
- Muestra score con desglose por control.
- Genera recomendaciones al final del analisis.
- Exporta reportes en JSON y Markdown.
- Soporta idioma espanol e ingles para UI y exportes.
- Permite copiar un enlace compartible con la configuracion del analisis.
- Incluye modo claro y modo oscuro.

## Enlaces Compartibles

La app puede abrir un analisis desde parametros de URL:

```text
https://juguitos.github.io/mailshield-radar/?domain=dominio.com&lang=en&dkim=auto&depth=broad
```

Parametros soportados:

- `domain`: dominio a analizar.
- `lang`: `es` o `en`.
- `theme`: `light` o `dark`.
- `resolver`: `auto`, `google` o `cloudflare`.
- `dkim`: `auto` o `specific`.
- `depth`: `quick` o `broad`.
- `selectors`: lista de selectores separados por espacios, comas o punto y coma.

## Ejecutar Localmente

Abre `index.html` en el navegador. Si el navegador bloquea alguna consulta por origen local, levanta un servidor estatico:

```bash
python3 -m http.server 8080
```

Y abre:

```text
http://localhost:8080
```

## Limitaciones

DKIM no permite enumerar todos los selectores desde DNS: cada selector es una etiqueta arbitraria. La app prueba una lista comun y permite agregar selectores propios.

SPF se evalua de forma basica. El conteo mostrado identifica mecanismos que generan consultas DNS en el registro principal, pero no expande recursivamente todos los `include`.

## Privacidad

Las consultas DNS se hacen desde el navegador hacia Google DNS o Cloudflare DNS usando DNS-over-HTTPS. No hay backend, base de datos ni almacenamiento remoto en este proyecto.

La preferencia de idioma y tema se guarda localmente en el navegador mediante `localStorage`.

## Roadmap

- SPF recursivo con expansion de `include`.
- Presets DKIM por proveedor.
- Historial local de dominios analizados.
- Validacion mas profunda de tags DMARC.
- CI con GitHub Actions para validar cambios.

## Autor

Hecho por Luis Daniel (Juguitos): https://github.com/Juguitos
