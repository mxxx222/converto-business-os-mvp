"""Email templates for Converto Business OS."""

from typing import Dict, Any


class EmailTemplates:
    """Email templates for various business scenarios."""
    
    @staticmethod
    def pilot_signup_welcome(name: str, company: str) -> str:
        """Welcome email for pilot signups."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Tervetuloa Converto Business OS:een!</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cta {{ background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Tervetuloa Converto Business OS:een!</h1>
                    <p>Kiitos kiinnostuksestasi automatisointiin</p>
                </div>
                <div class="content">
                    <h2>Hei {name}!</h2>
                    <p>Hienoa, että {company} liittyy mukaan Converto Business OS -pilottiin!</p>
                    
                    <h3>🎯 Mitä seuraavaksi?</h3>
                    <ul>
                        <li><strong>Päivä 1:</strong> Saat sähköpostitse käyttöohjeet</li>
                        <li><strong>Päivä 3:</strong> 15 minuutin onboarding-kutsu</li>
                        <li><strong>Päivä 7:</strong> Ensimmäinen automatisointi käynnissä</li>
                    </ul>
                    
                    <p>Converto Business OS automatisoi:</p>
                    <ul>
                        <li>🧾 Kuitin skannaus ja kategorisointi</li>
                        <li>🧮 ALV-laskelmat automaattisesti</li>
                        <li>⚖️ Lakisäädäntöjen seuranta</li>
                        <li>📊 Raportointi ja analytiikka</li>
                    </ul>
                    
                    <a href="https://converto.fi/dashboard" class="cta">Aloita käyttö</a>
                    
                    <p><strong>Kysymykset?</strong> Vastaa tähän sähköpostiin tai soita +358 40 123 4567</p>
                </div>
                <div class="footer">
                    <p>Converto Business OS | Automatisoi yrityksesi tänään</p>
                    <p>converto.fi | hello@converto.fi</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def deployment_success(service_name: str, url: str) -> str:
        """Deployment success notification."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Deployment Onnistui - {service_name}</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .success {{ background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; }}
                .service {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Deployment Onnistui</h1>
                <div class="success">
                    <strong>Palvelu:</strong> {service_name}<br>
                    <strong>Status:</strong> Käynnissä<br>
                    <strong>URL:</strong> <a href="{url}">{url}</a>
                </div>
                <div class="service">
                    <h3>Seuraavat askeleet:</h3>
                    <ul>
                        <li>Tarkista toimivuus: <a href="{url}">{url}</a></li>
                        <li>Testaa kaikki päätoiminnot</li>
                        <li>Ilmoita asiakkaalle kun valmis</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def daily_metrics_report(metrics: Dict[str, Any]) -> str:
        """Daily metrics report email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Päivittäinen Raportti - {metrics.get('date', 'Tänään')}</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .metric {{ background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #667eea; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 Päivittäinen Raportti</h1>
                <p><strong>Päivä:</strong> {metrics.get('date', 'Tänään')}</p>
                
                <div class="metric">
                    <h3>Pilot Rekisteröinnit</h3>
                    <div class="metric-value">{metrics.get('pilot_signups', 0)}</div>
                    <p>Uudet rekisteröinnit tänään</p>
                </div>
                
                <div class="metric">
                    <h3>OCR Käsittelyt</h3>
                    <div class="metric-value">{metrics.get('ocr_processed', 0)}</div>
                    <p>Kuitit käsitelty</p>
                </div>
                
                <div class="metric">
                    <h3>API Kutsut</h3>
                    <div class="metric-value">{metrics.get('api_calls', 0)}</div>
                    <p>Yhteensä API-kutsuja</p>
                </div>
                
                <div class="metric">
                    <h3>Uptime</h3>
                    <div class="metric-value">{metrics.get('uptime', '99.9%')}</div>
                    <p>Palvelun saatavuus</p>
                </div>
                
                <h3>🎯 Tavoitteet</h3>
                <ul>
                    <li>Pilot rekisteröinnit: {metrics.get('target_signups', 20)} (tavoite)</li>
                    <li>OCR käsittelyt: {metrics.get('target_ocr', 100)} (tavoite)</li>
                    <li>Uptime: >99% (tavoite)</li>
                </ul>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def error_alert(error_message: str, service: str, severity: str) -> str:
        """Error alert email."""
        severity_colors = {
            "low": "#ffc107",
            "medium": "#fd7e14", 
            "high": "#dc3545",
            "critical": "#6f42c1"
        }
        
        color = severity_colors.get(severity, "#6c757d")
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>🚨 Virhe - {service}</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .error {{ background: {color}; color: white; padding: 15px; border-radius: 5px; }}
                .details {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚨 Virheilmoitus</h1>
                <div class="error">
                    <h2>{service}</h2>
                    <p><strong>Vakavuus:</strong> {severity.upper()}</p>
                </div>
                <div class="details">
                    <h3>Virheviesti:</h3>
                    <pre>{error_message}</pre>
                </div>
                <h3>Toimenpiteet:</h3>
                <ul>
                    <li>Tarkista palvelun lokit</li>
                    <li>Ilmoita kehittäjälle</li>
                    <li>Seuraa palvelun tilaa</li>
                </ul>
            </div>
        </body>
        </html>
        """
