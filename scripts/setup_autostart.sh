#!/bin/bash
# Setup script to install ChefPax IoT sensor monitor as a systemd service
# Run this script on the Raspberry Pi

echo "🚀 Setting up ChefPax IoT Sensor Monitor Auto-Start..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run with sudo: sudo bash setup_autostart.sh"
    exit 1
fi

# Create the service file
cat > /etc/systemd/system/chefpax-iot.service << 'EOF'
[Unit]
Description=ChefPax IoT Sensor Monitor
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/chefpax-iot
ExecStart=/usr/bin/python3 /home/pi/chefpax-iot/comprehensive_sensor_monitor.py
Restart=always
RestartSec=10
StandardOutput=append:/home/pi/chefpax-iot/sensor_monitor.log
StandardError=append:/home/pi/chefpax-iot/sensor_monitor_error.log

# Environment variables
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created at /etc/systemd/system/chefpax-iot.service"

# Reload systemd to recognize the new service
systemctl daemon-reload
echo "✅ Systemd daemon reloaded"

# Enable the service to start on boot
systemctl enable chefpax-iot.service
echo "✅ Service enabled to start on boot"

# Start the service now
systemctl start chefpax-iot.service
echo "✅ Service started"

# Show the service status
echo ""
echo "📊 Service Status:"
systemctl status chefpax-iot.service --no-pager

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Useful commands:"
echo "  Check status:    sudo systemctl status chefpax-iot"
echo "  View logs:       sudo journalctl -u chefpax-iot -f"
echo "  Stop service:    sudo systemctl stop chefpax-iot"
echo "  Start service:   sudo systemctl start chefpax-iot"
echo "  Restart service: sudo systemctl restart chefpax-iot"
echo "  Disable auto-start: sudo systemctl disable chefpax-iot"
echo ""
echo "🎉 Your sensor monitor will now auto-start on every reboot!"

