# 🚀 Raspberry Pi Auto-Start Setup

This guide shows you how to set up your ChefPax IoT sensor monitor to automatically start on boot and restart if it crashes.

## 📋 What This Does

- ✅ **Auto-starts on boot** - Script runs automatically when Raspberry Pi powers on
- ✅ **Automatic restart** - If the script crashes, it restarts after 10 seconds
- ✅ **Logging** - All output is saved to log files
- ✅ **Single instance** - Only one copy of the script runs at a time
- ✅ **System service** - Managed by systemd like other system services

## 🔧 Setup Instructions

### Step 1: Transfer the Setup Script to Raspberry Pi

From your Mac, copy the setup script to the Raspberry Pi:

```bash
scp setup_autostart.sh pi@192.168.87.27:/home/pi/chefpax-iot/
```

### Step 2: SSH into Raspberry Pi

```bash
ssh pi@192.168.87.27
```

### Step 3: Make the Script Executable

```bash
cd ~/chefpax-iot
chmod +x setup_autostart.sh
```

### Step 4: Run the Setup Script

```bash
sudo bash setup_autostart.sh
```

This will:
- Create a systemd service file
- Enable auto-start on boot
- Start the service immediately
- Show you the current status

## 📊 Managing the Service

### Check if Service is Running

```bash
sudo systemctl status chefpax-iot
```

### View Live Logs

```bash
# View systemd journal logs (live)
sudo journalctl -u chefpax-iot -f

# Or view the log files directly
tail -f ~/chefpax-iot/sensor_monitor.log
tail -f ~/chefpax-iot/sensor_monitor_error.log
```

### Stop the Service

```bash
sudo systemctl stop chefpax-iot
```

### Start the Service

```bash
sudo systemctl start chefpax-iot
```

### Restart the Service

```bash
sudo systemctl restart chefpax-iot
```

### Disable Auto-Start (Keep Service but Don't Auto-Start)

```bash
sudo systemctl disable chefpax-iot
```

### Enable Auto-Start Again

```bash
sudo systemctl enable chefpax-iot
```

### Remove the Service Completely

```bash
sudo systemctl stop chefpax-iot
sudo systemctl disable chefpax-iot
sudo rm /etc/systemd/system/chefpax-iot.service
sudo systemctl daemon-reload
```

## 🔄 Updating the Script

If you make changes to `comprehensive_sensor_monitor.py`, you need to restart the service:

```bash
sudo systemctl restart chefpax-iot
```

## 🐛 Troubleshooting

### Service Won't Start

Check the error logs:
```bash
sudo journalctl -u chefpax-iot -n 50 --no-pager
```

Or:
```bash
cat ~/chefpax-iot/sensor_monitor_error.log
```

### Check Service Configuration

```bash
sudo systemctl cat chefpax-iot
```

### Test Script Manually First

Before setting up the service, test that the script runs manually:
```bash
cd ~/chefpax-iot
python3 comprehensive_sensor_monitor.py
```

If it works manually but not as a service, check:
- File permissions
- Python path
- GPIO permissions (user should be in `gpio` group)

## 🎯 What Happens on Reboot

1. Raspberry Pi boots up
2. Network comes online
3. **chefpax-iot service starts automatically** (waits for network)
4. Script begins collecting and sending sensor data
5. If script crashes, it automatically restarts after 10 seconds

## 📝 Log Files

The service creates two log files:

- **sensor_monitor.log** - Normal output (sensor readings, API responses)
- **sensor_monitor_error.log** - Error messages

To view recent logs:
```bash
tail -100 ~/chefpax-iot/sensor_monitor.log
```

To clear old logs (if they get too large):
```bash
> ~/chefpax-iot/sensor_monitor.log
> ~/chefpax-iot/sensor_monitor_error.log
```

## ✅ Verification

After setup, verify everything is working:

1. **Check service status:**
   ```bash
   sudo systemctl status chefpax-iot
   ```
   Should show `active (running)` in green

2. **Check logs:**
   ```bash
   tail -20 ~/chefpax-iot/sensor_monitor.log
   ```
   Should show recent sensor readings

3. **Test reboot:**
   ```bash
   sudo reboot
   ```
   Wait for Raspberry Pi to restart, then SSH back in and check status

4. **Verify on dashboard:**
   Visit https://www.chefpax.com/admin/iot-monitoring
   You should see live sensor data!

## 🎉 Benefits

- **Reliable** - Sensor monitoring continues even after power outages
- **Automatic** - No manual intervention needed
- **Monitored** - Easy to check status and logs
- **Professional** - Uses industry-standard systemd service management

## 🚨 Important Notes

- The service runs as the `pi` user, so it has proper GPIO access
- The service waits for network to be online before starting
- Auto-restart happens after 10 seconds if the script fails
- Logs are appended (not overwritten) so you can track issues over time

---

**🎯 Once set up, your IoT monitoring system is production-ready and will survive power cycles!**

