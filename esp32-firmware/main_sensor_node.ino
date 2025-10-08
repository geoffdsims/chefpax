/*
 * ChefPax IoT Sensor Node - ESP32 Firmware
 * Monitors temperature, humidity, light, pH, CO2, and water levels
 * Sends data to ChefPax API endpoint
 * 
 * Hardware Components:
 * - ESP32 DevKit C
 * - DHT22 (Temperature & Humidity) -> GPIO 4
 * - Photoresistor (Light Level) -> GPIO 34 (ADC1_6)
 * - Analog pH Sensor -> GPIO 35 (ADC1_7)
 * - MH-Z19 CO2 Sensor (UART) -> RX: GPIO 16, TX: GPIO 17
 * - HC-SR04 Ultrasonic (Water Level) -> Trig: GPIO 5, Echo: GPIO 18
 * - YF-S201 Water Flow Sensor -> GPIO 21
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ===== CONFIGURATION - UPDATE THESE =====
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_ENDPOINT = "http://YOUR_SERVER_IP:3000/api/iot/sensors";
const char* DEVICE_ID = "grow_room_main"; // Options: grow_room_main, tray_monitor_1, water_system
const char* LOCATION = "grow_room"; // Options: grow_room, tray_1, water_reservoir

// ===== PIN DEFINITIONS =====
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define LIGHT_SENSOR_PIN 34
#define PH_SENSOR_PIN 35
#define CO2_RX_PIN 16
#define CO2_TX_PIN 17
#define ULTRASONIC_TRIG_PIN 5
#define ULTRASONIC_ECHO_PIN 18
#define WATER_FLOW_PIN 21

// ===== SENSOR OBJECTS =====
DHT dht(DHT_PIN, DHT_TYPE);

// ===== GLOBAL VARIABLES =====
unsigned long lastReadingTime = 0;
const unsigned long READING_INTERVAL = 30000; // 30 seconds
volatile int waterFlowPulseCount = 0;
float waterFlowRate = 0;

// ===== CO2 SENSOR VARIABLES =====
byte co2Request[] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
byte co2Response[9];

// ===== CALIBRATION VALUES =====
// pH Sensor Calibration (adjust after calibration with pH 4.0 and 7.0 solutions)
const float PH_NEUTRAL_VOLTAGE = 2.5;  // Voltage at pH 7.0
const float PH_ACID_VOLTAGE = 3.3;     // Voltage at pH 4.0
const float PH_NEUTRAL = 7.0;
const float PH_ACID = 4.0;

// Light Sensor Calibration
const float LIGHT_DARK_RESISTANCE = 10000.0;   // 10kΩ in complete darkness
const float LIGHT_BRIGHT_RESISTANCE = 1000.0;  // 1kΩ in bright light
const float LIGHT_SERIES_RESISTOR = 10000.0;   // 10kΩ series resistor

void IRAM_ATTR waterFlowPulseCounter() {
  waterFlowPulseCount++;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nChefPax IoT Sensor Node Starting...");
  
  // Initialize sensors
  dht.begin();
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(PH_SENSOR_PIN, INPUT);
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);
  pinMode(WATER_FLOW_PIN, INPUT_PULLUP);
  
  // Attach interrupt for water flow sensor
  attachInterrupt(digitalPinToInterrupt(WATER_FLOW_PIN), waterFlowPulseCounter, FALLING);
  
  // Initialize CO2 sensor (UART)
  Serial2.begin(9600, SERIAL_8N1, CO2_RX_PIN, CO2_TX_PIN);
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("Sensor node initialized successfully!");
  Serial.print("Device ID: ");
  Serial.println(DEVICE_ID);
  Serial.print("Location: ");
  Serial.println(LOCATION);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
  
  // Take readings at specified interval
  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = currentTime;
    
    Serial.println("\n===== Taking Sensor Readings =====");
    
    // Read and send all sensor data
    readAndSendTemperature();
    delay(100);
    
    readAndSendHumidity();
    delay(100);
    
    readAndSendLight();
    delay(100);
    
    readAndSendPH();
    delay(100);
    
    readAndSendCO2();
    delay(100);
    
    readAndSendWaterLevel();
    delay(100);
    
    readAndSendWaterFlow();
    delay(100);
    
    Serial.println("===== Readings Complete =====\n");
  }
  
  delay(1000); // Small delay to prevent overwhelming the processor
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void readAndSendTemperature() {
  float temperature = dht.readTemperature(); // Celsius
  
  if (isnan(temperature)) {
    Serial.println("❌ Failed to read temperature from DHT22");
    return;
  }
  
  Serial.print("🌡️  Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  
  sendSensorData("temperature", temperature, "°C");
}

void readAndSendHumidity() {
  float humidity = dht.readHumidity();
  
  if (isnan(humidity)) {
    Serial.println("❌ Failed to read humidity from DHT22");
    return;
  }
  
  Serial.print("💧 Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  sendSensorData("humidity", humidity, "%");
}

void readAndSendLight() {
  int rawValue = analogRead(LIGHT_SENSOR_PIN);
  float voltage = rawValue * (3.3 / 4095.0); // ESP32 ADC is 12-bit (0-4095)
  
  // Calculate resistance of photoresistor
  float resistance = LIGHT_SERIES_RESISTOR * (3.3 / voltage - 1);
  
  // Convert resistance to lux (simplified approximation)
  // In complete darkness: ~10kΩ = 0 lux
  // In bright light: ~1kΩ = 10000 lux
  float lux = map(resistance, LIGHT_BRIGHT_RESISTANCE, LIGHT_DARK_RESISTANCE, 10000, 0);
  lux = constrain(lux, 0, 10000);
  
  Serial.print("💡 Light Level: ");
  Serial.print(lux);
  Serial.print(" lux (Raw: ");
  Serial.print(rawValue);
  Serial.println(")");
  
  sendSensorData("light", lux, "lux", rawValue);
}

void readAndSendPH() {
  int rawValue = analogRead(PH_SENSOR_PIN);
  float voltage = rawValue * (3.3 / 4095.0);
  
  // Calculate pH using two-point calibration
  float phSlope = (PH_NEUTRAL - PH_ACID) / (PH_NEUTRAL_VOLTAGE - PH_ACID_VOLTAGE);
  float phIntercept = PH_NEUTRAL - phSlope * PH_NEUTRAL_VOLTAGE;
  float ph = phSlope * voltage + phIntercept;
  
  // Constrain to valid pH range
  ph = constrain(ph, 0, 14);
  
  Serial.print("🧪 pH Level: ");
  Serial.print(ph, 2);
  Serial.print(" (Voltage: ");
  Serial.print(voltage, 3);
  Serial.println("V)");
  
  sendSensorData("ph", ph, "pH", rawValue);
}

void readAndSendCO2() {
  // Send request to MH-Z19 sensor
  Serial2.write(co2Request, 9);
  delay(50);
  
  // Read response
  int bytesRead = Serial2.readBytes(co2Response, 9);
  
  if (bytesRead == 9 && co2Response[0] == 0xFF && co2Response[1] == 0x86) {
    int co2ppm = (co2Response[2] << 8) | co2Response[3];
    
    Serial.print("🌫️  CO2 Level: ");
    Serial.print(co2ppm);
    Serial.println(" ppm");
    
    sendSensorData("co2", co2ppm, "ppm");
  } else {
    Serial.println("❌ Failed to read CO2 from MH-Z19");
  }
}

void readAndSendWaterLevel() {
  // Send ultrasonic pulse
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  
  // Read echo
  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    Serial.println("❌ Failed to read water level (timeout)");
    return;
  }
  
  // Calculate distance in cm (speed of sound: 343 m/s)
  float distance = duration * 0.0343 / 2;
  
  // Convert distance to water level percentage
  // Assuming tank is 25cm tall and sensor is at top
  const float TANK_HEIGHT = 25.0;
  float waterLevel = ((TANK_HEIGHT - distance) / TANK_HEIGHT) * 100;
  waterLevel = constrain(waterLevel, 0, 100);
  
  Serial.print("🌊 Water Level: ");
  Serial.print(waterLevel);
  Serial.print("% (Distance: ");
  Serial.print(distance);
  Serial.println(" cm)");
  
  sendSensorData("water_level", waterLevel, "%", distance);
}

void readAndSendWaterFlow() {
  // Calculate flow rate from pulse count
  // YF-S201: 450 pulses per liter
  const float PULSES_PER_LITER = 450.0;
  const float MEASUREMENT_INTERVAL_SECONDS = READING_INTERVAL / 1000.0;
  
  float flowRate = (waterFlowPulseCount / PULSES_PER_LITER) / (MEASUREMENT_INTERVAL_SECONDS / 60.0); // L/min
  
  Serial.print("💦 Water Flow: ");
  Serial.print(flowRate, 2);
  Serial.print(" L/min (Pulses: ");
  Serial.print(waterFlowPulseCount);
  Serial.println(")");
  
  sendSensorData("water_flow", flowRate, "L/min", waterFlowPulseCount);
  
  // Reset pulse counter
  waterFlowPulseCount = 0;
}

void sendSensorData(const char* sensorType, float value, const char* unit, float rawValue = -1) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected. Skipping upload.");
    return;
  }
  
  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["sensorType"] = sensorType;
  doc["value"] = value;
  doc["unit"] = unit;
  doc["location"] = LOCATION;
  if (rawValue >= 0) {
    doc["rawValue"] = rawValue;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Data sent successfully (HTTP ");
    Serial.print(httpResponseCode);
    Serial.println(")");
    
    // Print response
    String response = http.getString();
    Serial.println("   Response: " + response);
  } else {
    Serial.print("❌ Error sending data: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

