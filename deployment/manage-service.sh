#!/bin/bash

# Minecraft Check API - Service Management Script
# Einfache Verwaltung des systemd Services

SERVICE_NAME="minecraft-check-api"
API_DIR="/opt/minecraft-check-api"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Bitte als root ausführen (sudo)"
        exit 1
    fi
}

show_status() {
    print_status "Service Status für $SERVICE_NAME:"
    systemctl status $SERVICE_NAME --no-pager -l
    echo ""
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Service läuft"
        echo ""
        print_status "API Test:"
        if curl -f -s http://localhost:3000/api/health > /dev/null; then
            print_success "API ist erreichbar: http://localhost:3000"
        else
            print_warning "API ist nicht erreichbar"
        fi
    else
        print_error "Service läuft nicht"
    fi
}

start_service() {
    print_status "Starte $SERVICE_NAME..."
    systemctl start $SERVICE_NAME
    sleep 2
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Service erfolgreich gestartet"
    else
        print_error "Fehler beim Starten des Services"
        show_logs 10
    fi
}

stop_service() {
    print_status "Stoppe $SERVICE_NAME..."
    systemctl stop $SERVICE_NAME
    sleep 1
    
    if ! systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Service erfolgreich gestoppt"
    else
        print_error "Fehler beim Stoppen des Services"
    fi
}

restart_service() {
    print_status "Starte $SERVICE_NAME neu..."
    systemctl restart $SERVICE_NAME
    sleep 3
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Service erfolgreich neu gestartet"
        test_api
    else
        print_error "Fehler beim Neustart des Services"
        show_logs 10
    fi
}

enable_service() {
    print_status "Aktiviere Autostart für $SERVICE_NAME..."
    systemctl enable $SERVICE_NAME
    print_success "Autostart aktiviert"
}

disable_service() {
    print_status "Deaktiviere Autostart für $SERVICE_NAME..."
    systemctl disable $SERVICE_NAME
    print_success "Autostart deaktiviert"
}

show_logs() {
    local lines=${1:-50}
    print_status "Zeige letzte $lines Log-Einträge:"
    journalctl -u $SERVICE_NAME -n $lines --no-pager
}

follow_logs() {
    print_status "Live Logs (Ctrl+C zum Beenden):"
    journalctl -u $SERVICE_NAME -f
}

test_api() {
    print_status "API Test wird durchgeführt..."
    
    # Health Check
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        print_success "Health Check: OK"
    else
        print_error "Health Check: FEHLER"
        return 1
    fi
    
    # Server Query Test
    local test_result=$(curl -s "http://localhost:3000/api/server/ping?host=mc.hypixel.net&port=25565&type=java")
    if echo "$test_result" | grep -q '"success":true'; then
        print_success "Server Query Test: OK"
    else
        print_warning "Server Query Test: Möglicherweise Netzwerkprobleme"
    fi
    
    echo ""
    print_status "API Endpoints:"
    echo "  Health Check: http://localhost:3000/api/health"
    echo "  Dokumentation: http://localhost:3000/api/docs"
    echo "  Server Status: http://localhost:3000/api/server/status"
}

update_api() {
    print_status "API Update wird durchgeführt..."
    
    # Service stoppen
    stop_service
    
    # Backup erstellen
    local backup_dir="$API_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Erstelle Backup: $backup_dir"
    cp -r $API_DIR $backup_dir
    
    # Code aktualisieren
    cd $API_DIR
    print_status "Lade neuesten Code..."
    git pull origin main
    
    # Dependencies aktualisieren
    print_status "Aktualisiere Dependencies..."
    npm ci --only=production
    
    # Berechtigungen korrigieren
    chown -R www-data:www-data $API_DIR
    
    # Service wieder starten
    start_service
    
    # Test durchführen
    sleep 3
    test_api
    
    print_success "Update abgeschlossen!"
    print_status "Backup verfügbar unter: $backup_dir"
}

show_config() {
    print_status "Aktuelle Konfiguration:"
    echo ""
    echo "Service Datei: /etc/systemd/system/$SERVICE_NAME.service"
    echo "API Verzeichnis: $API_DIR"
    echo "Environment Datei: $API_DIR/.env"
    echo ""
    
    if [ -f "$API_DIR/.env" ]; then
        print_status "Environment Variablen:"
        cat $API_DIR/.env
    else
        print_warning "Keine .env Datei gefunden"
    fi
}

show_help() {
    echo "Minecraft Check API - Service Management"
    echo "======================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      Zeigt Service Status und API Test"
    echo "  start       Startet den Service"
    echo "  stop        Stoppt den Service"
    echo "  restart     Startet den Service neu"
    echo "  enable      Aktiviert Autostart"
    echo "  disable     Deaktiviert Autostart"
    echo "  logs        Zeigt Log-Einträge"
    echo "  live        Live Logs anzeigen"
    echo "  test        API Funktionstest"
    echo "  update      API Code und Dependencies aktualisieren"
    echo "  config      Aktuelle Konfiguration anzeigen"
    echo "  help        Diese Hilfe anzeigen"
    echo ""
    echo "Beispiele:"
    echo "  sudo $0 status"
    echo "  sudo $0 restart"
    echo "  sudo $0 logs"
    echo "  sudo $0 update"
}

# Hauptlogik
case "$1" in
    status)
        show_status
        ;;
    start)
        check_root
        start_service
        ;;
    stop)
        check_root
        stop_service
        ;;
    restart)
        check_root
        restart_service
        ;;
    enable)
        check_root
        enable_service
        ;;
    disable)
        check_root
        disable_service
        ;;
    logs)
        show_logs ${2:-50}
        ;;
    live)
        follow_logs
        ;;
    test)
        test_api
        ;;
    update)
        check_root
        update_api
        ;;
    config)
        show_config
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unbekannter Befehl: $1"
        echo ""
        show_help
        exit 1
        ;;
esac