#include <WiFi.h>
#include <Arduino.h>

#define FREQ_CONNECT_AP 500 // ms
#define TRY_CONNECT_AP 10 // times

bool checkNetwork(char *_ssid){
  bool result = false;
  uint16_t nets = WiFi.scanNetworks();

  for(int i = 0; i < nets; i++){
    String ssid = WiFi.SSID(i);

    if(ssid == _ssid){
      result = true;
      break;
    }
  }
  return result;
}

bool connectAP(char *ssid, char *pass){
  uint8_t cnt = 0;

  WiFi.mode(WIFI_MODE_APSTA);
  WiFi.disconnect(true);
  delay(1000);
  if(!checkNetwork(ssid)){
    Serial.println("SSID is not found.");
    return false;
  }
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED && cnt < TRY_CONNECT_AP){
    delay(FREQ_CONNECT_AP);
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