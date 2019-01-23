#include <WiFi.h>
#include <Arduino.h>

#define TRY_CONNECT_AP 10

bool connectAP(char *ssid, char *pass){
  uint8_t cnt = 0;

  WiFi.mode(WIFI_MODE_APSTA);
  WiFi.disconnect(true);
  delay(1000);
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED && cnt < TRY_CONNECT_AP){
    delay(500);
    Serial.print(".");
    cnt += 1;
  }
  if(WiFi.status() != WL_CONNECTED) return false;

  Serial.println("\nWiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  return true;
}

void startAP(char *apssid, char *appass){
  WiFi.mode(WIFI_MODE_APSTA);
  WiFi.softAP(apssid, appass);
}

bool checkNetwork(char *ssid){
  bool result = false;
  uint16_t nets = WiFi.scanNetworks();

  // Serial.println("Found " + String(nets) + " networks.");
  for(int i = 0; i < nets; i++){
    String ssid = WiFi.SSID(i);

    // Serial.println("SSID: " + ssid);
    if(ssid == ssid){
      result = true;
      break;
    }
  }
  return result;
}